import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Flex,
  Image,
  Heading,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import SimplePeerFiles from 'simple-peer-files';
import DeviceDetector from 'device-detector-js';
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import logo from '../assets/logo.png';
import './Home.css';
import { Device } from '../components/Device';
const customConfig = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  length: 2,
  style: 'capital',
};
const deviceDetector = new DeviceDetector();
const device = deviceDetector.parse(navigator.userAgent);
const fileDownload = require('js-file-download');
const P2PT = require('p2pt');
const is_ip_private = require('private-ip');
const trackersAnnounceURLs = [
  'wss://tracker.files.fm:7073/announce',
  'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://peertube.cpy.re:443/tracker/socket',
];
const p2pt = new P2PT(trackersAnnounceURLs, 'localdev123');
let userInfo = {
  id: p2pt._peerId,
  nickname: uniqueNamesGenerator(customConfig),
};
console.log('My peer id : ' + p2pt._peerId);

export const Home = () => {
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [filetoSend, setFile] = useState();
  const [fileName, setFileName] = useState('');
  const spf = new SimplePeerFiles();
  const addNewPeer = peer => {
    peer.localAddress !== undefined
      ? (peer.ip = peer.localAddress)
      : (peer.ip = peer.remoteAddress);
    if (peer.ip !== undefined) {
      if (is_ip_private(peer.ip)) {
        //device.device.model = p2pt._peerId;
        p2pt.send(peer, {
          type: 'device-info',
          device: device,
          nickname: userInfo.nickname,
        });
      }
    }
    //setConnectedPeers(prevPeers => [...prevPeers, peer]);
  };
  useEffect(() => {
    p2pt.on('peerconnect', peer => {
      console.log('peer remote address', peer);
      console.log(`New peer connected with id: ${peer.id}`);
      addNewPeer(peer);
    });
    p2pt.start();
    const done = file => {
      console.log('done');
      if (file) {
        fileDownload(file, file.name);
      }
    };

    p2pt.on('trackerconnect', async (tracker, stats) => {
      console.log('connected to p2p network');
    });
    const prepareToRecieve = peer => {
      //console.log("peerid in recieve", peer.id);
      console.log('peer in spf recieve', peer);
      spf.receive(peer, 'myFileID').then(transfer => {
        transfer.on('progress', sentBytes => {
          console.log(sentBytes);
        });
        transfer.on('done', done);
        transfer.on('cancelled', () => {
          console.log('cancelling');
        });
      });
      p2pt.send(peer, {
        type: 'ready',
        fileId: fileName,
      });
    };
    const startFileTransfer = peer => {
      //console.log("peerid in send", peer.id);
      console.log('filetorsend', filetoSend);
      console.log('peer in spf send', peer);
      spf.send(peer, 'myFileID', inputFile.current.files[0]).then(transfer => {
        transfer.on('progress', console.log);
        transfer.on('cancelled', () => {
          console.log('cancelling');
        });
        transfer.on('done', () => {
          console.log('successfuly sent the file');
          //p2pt.destroy();
        });
        transfer.start();
      });
    };

    p2pt.on('peerclose', peer => {
      console.log(`A peer has disconnected with id: ${peer.id}`);
      setConnectedPeers(connectedPeers => {
        return connectedPeers.filter(item => {
          return item.id !== peer.id;
        });
      });
    });

    p2pt.on('data', (peer, data) => {
      //console.log(data);
    });
    p2pt.on('msg', async (peer, msg) => {
      console.log('peer in msg', peer);
      console.log('msgfileid', msg);

      if (msg.type === 'device-info') {
        console.log('got the device info', msg.device);
        peer.nickname = msg.nickname;
        peer.device = msg.device;
        setConnectedPeers(prevPeers => [...prevPeers, peer]);
      }

      if (msg.type === 'sending') {
        console.log('preparing to send');
        prepareToRecieve(peer); // peer should be initial sender peer
      }

      if (msg.type === 'ready') {
        console.log('got the message that reciever is ready');
        startFileTransfer(peer);
      }
    });
  }, []);
  const inputFile = useRef();
  const clickFileUpload = () => {
    inputFile.current.click();
  };

  const handleUploadFile = peer => {
    console.log('sendingggggggg');
    console.log(fileName);
    const file = filetoSend;
    console.log(file);

    p2pt.send(peer, {
      type: 'sending',
      fileId: fileName,
    });
    console.log('peer before sending', peer);
  };
  return (
    <Flex
      backgroundColor="#00B4D8"
      h="100vh"
      className="Home"
      direction="column"
      align="center"
    >
      <Image boxSize="150px" objectFit="cover" src={logo} alt="Segun Adebayo" />
      <Flex direction="column" align="center">
        <h2>Your nickname: {userInfo.nickname}</h2>
        {connectedPeers.length > 0 ? (
          connectedPeers.map((item, index) => {
            return (
              <Device
                key={index}
                deviceInfo={item.device}
                nickname={item.nickname}
              />
            );
          })
        ) : (
          <Heading size="lg" fontWeight="bold" my={3} w={'50%'}>
            Other devices should appear here, make sure you are using either
            Google Chrome, Opera or Microsoft Edge
          </Heading>
        )}
      </Flex>
    </Flex>
  );
};
