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
  useToast,
  Avatar,
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
import NET from 'vanta/dist/vanta.net.min';
import logo from '../assets/logo.png';
import logo_light from '../assets/logo_light.png';
import './Home.css';
import { Device } from '../components/Device';
import { ChatMessage } from '../components/ChatMessage';
import { FileAcceptPrompt } from '../components/FileAcceptPrompt';
import { FileProgress } from '../components/FileProgress';
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
// const trackersAnnounceURLs = [
//   'wss://tracker.files.fm:7073/announce',
//   'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
//   'wss://tracker.openwebtorrent.com',
//   'wss://tracker.btorrent.xyz',
//   'wss://peertube.cpy.re:443/tracker/socket',
// ];

const trackersAnnounceURLs = [
  'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
  'wss://tracker.openwebtorrent.com',
];
const p2pt = new P2PT(trackersAnnounceURLs, 'local-air-send');
let userInfo = {
  id: p2pt._peerId,
  nickname: uniqueNamesGenerator(customConfig),
};
console.log('My peer id : ' + p2pt._peerId);

export const Home = () => {
  const [connectedPeers, setConnectedPeers] = useState([]);

  const toast = useToast();
  const inputFile = useRef();
  let fileProgress = useRef();
  let transferSpeed = useRef();
  let clientIp = useRef();
  const toastIdRef = useRef();

  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);
  const getPublicIp = async () => {
    const response = await fetch('https://api.bigdatacloud.net/data/client-ip');
    const data = await response.json();
    clientIp.current = data.ipString;
  };
  const spf = new SimplePeerFiles();
  const addNewPeer = peer => {
    // peer.localAddress !== undefined
    //   ? (peer.ip = peer.localAddress)
    //   : (peer.ip = peer.remoteAddress);
    // if (peer.ip !== undefined) {
    //   if (is_ip_private(peer.ip)) {
    //     p2pt.send(peer, {
    //       type: 'device-info',
    //       device: device,
    //       nickname: userInfo.nickname,
    //     });
    //   }
    // }
    console.log('clientip', clientIp.current);
    p2pt.send(peer, {
      type: 'device-info',
      device: device,
      nickname: userInfo.nickname,
      ip: clientIp.current,
    });
    //setConnectedPeers(prevPeers => [...prevPeers, peer]);
  };
  const displayMesageToast = (message, nickname, peer) => {
    toast({
      position: 'top-right',
      isClosable: true,
      duration: 30000,
      render: ({ onClose }) => (
        <ChatMessage
          message={message}
          user={nickname}
          peer={peer}
          close={onClose}
        />
      ),
    });
  };
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x3fc6ff,
          maxDistance: 22.0,
        })
      );
    }
    getPublicIp();
    p2pt.on('peerconnect', peer => {
      console.log('peer remote address', peer);
      console.log(`New peer connected with id: ${peer.id}`);
      addNewPeer(peer);
    });
    p2pt.start();
    //p2pt.requestMorePeers();
    const done = file => {
      console.log('done');
      if (file) {
        fileDownload(file, file.name);
      }
    };

    p2pt.on('trackerconnect', async (tracker, stats) => {
      console.log(tracker);
      console.log('connected to p2p network');
    });
    let prevPercent = 0;
    const calculateTransferSpeed = (percent, fileSize) => {
      transferSpeed.current = ((percent - prevPercent) * fileSize) / 100;
      prevPercent = percent;
    };
    const prepareToRecieve = (peer, fileName, fileSize) => {
      //console.log("peerid in recieve", peer.id);
      console.log('peer in spf recieve', peer);
      spf.receive(peer, 'myFileID').then(transfer => {
        transfer.on('progress', progress => {
          fileProgress.current = progress;

          toast.update(toastProgressId, {
            position: 'top-right',
            isClosable: true,
            duration: null,
            render: ({ id, onClose }) => {
              console.log('file progressssss', fileProgress);
              return (
                <FileProgress
                  peer={peer}
                  close={onClose}
                  fileName={fileName}
                  fileSize={fileSize}
                  user={peer.nickname}
                  prepareToRecieve={prepareToRecieve}
                  progress={fileProgress.current}
                  toastProgressId={id}
                  transferSpeed={transferSpeed.current}
                />
              );
            },
          });
        });
        transfer.on('done', file => {
          clearInterval(speedTest);
          prevPercent = 0;
          done(file);
          toast.close(toastProgressId);
        });
        transfer.on('cancelled', () => {
          console.log('cancelling');
        });
      });
      p2pt.send(peer, {
        type: 'ready',
        fileId: fileName,
      });
      let speedTest = setInterval(
        () => calculateTransferSpeed(fileProgress.current, fileSize),
        500
      );
      toast({
        position: 'top-right',
        isClosable: true,
        duration: 30000,
        render: ({ id, onClose }) => {
          toastProgressId = id;
          console.log('toastProgressId: ' + toastProgressId);
          return (
            <FileProgress
              peer={peer}
              close={onClose}
              fileName={fileName}
              fileSize={fileSize}
              user={peer.nickname}
              prepareToRecieve={prepareToRecieve}
              progress={fileProgress}
            />
          );
        },
      });
    };
    let toastProgressId = 0;
    const startFileTransfer = peer => {
      console.log('peer in spf send', peer);
      spf.send(peer, 'myFileID', inputFile.current.files[0]).then(transfer => {
        transfer.on('progress', progress => {
          console.log('progress', progress);
          fileProgress.current = progress;

          toast.update(toastProgressId, {
            position: 'top-right',
            isClosable: true,
            duration: null,
            render: ({ id, onClose }) => {
              console.log('file progressssss', fileProgress);
              return (
                <FileProgress
                  peer={peer}
                  close={onClose}
                  fileName={inputFile.current.files[0].name}
                  fileSize={inputFile.current.files[0].size}
                  user={peer.nickname}
                  prepareToRecieve={prepareToRecieve}
                  progress={fileProgress.current}
                  toastProgressId={id}
                  transferSpeed={transferSpeed.current}
                />
              );
            },
          });
        });
        transfer.on('cancelled', () => {
          console.log('cancelling');
        });
        transfer.on('done', () => {
          console.log('successfuly sent the file');
          toast.close(toastProgressId);
          clearInterval(speedTest);
          prevPercent = 0;
          //p2pt.destroy();
        });
        transfer.start();
        let speedTest = setInterval(
          () =>
            calculateTransferSpeed(
              fileProgress.current,
              inputFile.current.files[0].size
            ),
          1000
        );
        toast({
          position: 'top-right',
          isClosable: true,
          duration: 30000,
          render: ({ id, onClose }) => {
            toastProgressId = id;
            console.log('toastProgressId: ' + toastProgressId);
            return (
              <FileProgress
                peer={peer}
                close={onClose}
                fileName={inputFile.current.files[0].name}
                fileSize={inputFile.current.files[0].size}
                user={peer.nickname}
                prepareToRecieve={prepareToRecieve}
                progress={fileProgress}
              />
            );
          },
        });
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
      if (msg.type === 'device-info') {
        console.log('got the device info', msg.device);
        peer.nickname = msg.nickname;
        peer.device = msg.device;
        peer.ip = msg.ip;
        console.log('peer ip', msg.ip);
        console.log('client ip', clientIp);
        if (peer.ip === clientIp.current && clientIp.current !== undefined) {
          setConnectedPeers(prevPeers => [...prevPeers, peer]);
        } else {
          console.log('false');
        }
      }

      if (msg.type === 'chat') {
        console.log('got the chat message', msg.message);
        displayMesageToast(msg.message, peer.nickname, peer);
      }

      if (msg.type === 'sending') {
        toast({
          position: 'top-right',
          isClosable: true,
          duration: 30000,
          render: ({ onClose }) => (
            <FileAcceptPrompt
              peer={peer}
              close={onClose}
              fileName={msg.fileId}
              fileSize={msg.fileSize}
              user={peer.nickname}
              prepareToRecieve={prepareToRecieve}
            />
          ),
        });
        //prepareToRecieve(peer, msg.fileId); // peer should be initial sender peer
      }

      if (msg.type === 'ready') {
        console.log('got the message that reciever is ready');
        toast.close(toastIdRef.current);
        startFileTransfer(peer);
      }
    });
  }, []);

  const handleUploadFile = (peer, file) => {
    console.log('sendingggggggg');
    console.log(file);

    p2pt.send(peer, {
      type: 'sending',
      fileId: file.name,
      fileSize: file.size,
    });
    toastIdRef.current = toast({
      title: `Waiting for ${peer.nickname} to accept the file`,
      status: 'warning',
      duration: null,
      isClosable: false,
      position: 'top-right',
    });
  };

  const sendMessage = (peer, chatMessage) => {
    p2pt.send(peer, { type: 'chat', message: chatMessage });
    toast({
      title: `Message sent to ${peer.nickname}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };
  return (
    <Flex
      className="Home"
      direction="column"
      align="center"
      color="gray.300"
      minHeight="100vh"
      ref={vantaRef}
    >
      <Image
        boxSize="150px"
        objectFit="cover"
        src={logo_light}
        alt="Segun Adebayo"
      />
      <Flex direction="column" align="center">
        <Flex
          direction="column"
          align="center"
          justify="center"
          borderRadius="2xl"
          p={2}
          px={4}
          className="user"
        >
          <Avatar
            h={24}
            w={24}
            src={`https://avatars.dicebear.com/api/avataaars/${userInfo.id}.svg`}
          />
          <Text>Your name: {userInfo.nickname}</Text>
        </Flex>
        {connectedPeers.length > 0 ? (
          connectedPeers.map((item, index) => {
            return (
              <Device
                key={index}
                peer={item}
                deviceInfo={item.device}
                nickname={item.nickname}
                sendMessage={sendMessage}
                inputFile={inputFile}
                handleUploadFile={handleUploadFile}
              />
            );
          })
        ) : (
          <Heading size="md" fontWeight="bold" my={3} maxWidth={'500px'}>
            Devices on your network should appear here soon
          </Heading>
        )}
      </Flex>
    </Flex>
  );
};
