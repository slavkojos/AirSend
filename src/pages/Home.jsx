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
  //const [fileProgress, setFileProgress] = useState(null);
  const toast = useToast();
  const inputFile = useRef();
  let fileProgress = useRef();

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
                />
              );
            },
          });
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
          //p2pt.destroy();
        });
        transfer.start();
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
        setConnectedPeers(prevPeers => [...prevPeers, peer]);
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
      h="100vh"
      className="Home"
      direction="column"
      align="center"
      color="gray.300"
    >
      <Image
        boxSize="150px"
        objectFit="cover"
        src={logo_light}
        alt="Segun Adebayo"
      />
      <Flex direction="column" align="center">
        <h2>Your nickname: {userInfo.nickname}</h2>
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
          <Heading size="lg" fontWeight="bold" my={3} w={'50%'}>
            Other devices should appear here, make sure you are using either
            Google Chrome, Opera or Microsoft Edge
          </Heading>
        )}
      </Flex>
    </Flex>
  );
};
