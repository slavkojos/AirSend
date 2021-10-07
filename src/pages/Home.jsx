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
  SimpleGrid,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useState, useRef, useEffect, useCallback } from 'react';
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
import { ChangeRoomModal } from '../components/ChangeRoomModal';
import { ImEnter } from 'react-icons/im';
import { Link as RouterLink } from 'react-router-dom';
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

const p2pt = new P2PT(trackersAnnounceURLs, 'air-send-local');

let userInfo = {
  id: p2pt._peerId,
  nickname: uniqueNamesGenerator(customConfig),
};
export const Home = ({ match }) => {
  console.log('My peer id : ' + p2pt._peerId);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const inputFile = useRef();
  let fileProgress = useRef();
  let transferSpeed = useRef(0);
  let clientIp = useRef();
  let toastIdRef = useRef();
  let toastProgressId = useRef();
  const [vantaEffect, setVantaEffect] = useState();
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
    p2pt.removeAllListeners();
    console.log('useeffect called');
    if (match.params.id !== undefined) {
      setConnectedPeers([]);
      console.log('changing');
      p2pt.setIdentifier(`air-send-${match.params.id}`);
    } else {
      setConnectedPeers([]);
      console.log('on local');
      p2pt.setIdentifier(`air-send-local`);
    }
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          mouseControls: false,
          touchControls: true,
          gyroControls: true,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 0.5,
          color: 0x3fc6ff,
          points: 6.0,
          spacing: 18.0,
          maxDistance: 22.0,
        })
      );
    }
    console.log(vantaEffect);
    getPublicIp();
    p2pt.on('peerconnect', peer => {
      console.log('peer remote address', peer);
      console.log(`New peer connected with id: ${peer.id}`);
      addNewPeer(peer);
    });
    const done = file => {
      console.log('done');
      if (file) {
        fileDownload(file, file.name);
      }
    };
    const rejectFile = peer => {
      console.log('reject file');
      p2pt.send(peer, {
        type: 'reject',
      });
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
      spf.receive(peer, 'myFileID').then(transfer => {
        transfer.on('progress', progress => {
          fileProgress.current = progress;

          toast.update(toastProgressId.current, {
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
                  toastProgressId={toastProgressId.current}
                  transferSpeed={transferSpeed.current}
                  transfer={transfer}
                />
              );
            },
          });
        });
        transfer.on('done', file => {
          clearInterval(speedTest);
          prevPercent = 0;
          transferSpeed.current = 0;
          done(file);
          toast.close(toastProgressId.current);
        });
        transfer.on('cancelled', () => {
          toast({
            title: `Transfer cancelled!`,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
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
          toastProgressId.current = id;
          console.log('toastProgressId: ' + toastProgressId.current);
          return (
            <FileProgress
              peer={peer}
              close={onClose}
              fileName={fileName}
              fileSize={fileSize}
              user={peer.nickname}
              prepareToRecieve={prepareToRecieve}
              progress={fileProgress.current}
            />
          );
        },
      });
    };

    const startFileTransfer = peer => {
      console.log('peer in spf send', peer);
      spf.send(peer, 'myFileID', inputFile.current.files[0]).then(transfer => {
        transfer.on('progress', progress => {
          console.log('progress', progress);
          fileProgress.current = progress;

          toast.update(toastProgressId.current, {
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
                  toastProgressId={toastProgressId.current}
                  transferSpeed={transferSpeed.current}
                />
              );
            },
          });
        });
        transfer.on('cancelled', () => {
          toast({
            title: `Transfer cancelled!`,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        });
        transfer.on('done', () => {
          console.log('successfuly sent the file');
          toast.close(toastProgressId.current);
          clearInterval(speedTest);
          prevPercent = 0;
          transferSpeed.current = 0;
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
            toastProgressId.current = id;
            console.log('toastProgressId: ' + toastProgressId);
            return (
              <FileProgress
                peer={peer}
                close={onClose}
                fileName={inputFile.current.files[0].name}
                fileSize={inputFile.current.files[0].size}
                user={peer.nickname}
                prepareToRecieve={prepareToRecieve}
                progress={fileProgress.current}
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
      vantaEffect.resize();
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
        if (match.params.id !== undefined) {
          setConnectedPeers(prevPeers => [...prevPeers, peer]);
          vantaEffect.resize();
        } else if (
          peer.ip === clientIp.current &&
          clientIp.current !== undefined
        ) {
          setConnectedPeers(prevPeers => [...prevPeers, peer]);
          vantaEffect.resize();
        }
      }

      if (msg.type === 'chat') {
        console.log('got the chat message', msg.message);
        displayMesageToast(msg.message, peer.nickname, peer);
      }
      if (msg.type === 'reject') {
        toast.close(toastIdRef.current);
        toast({
          title: `${peer.nickname} rejected the file`,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
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
              rejectFile={rejectFile}
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
    p2pt.start();
    return () => {
      //if (vantaEffect) vantaEffect.destroy();
      if (p2pt) p2pt.destroy();
      p2pt.removeAllListeners();
    };
  }, [match.params.id, vantaEffect]);

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
      height="100%"
      width="100%"
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
          className={match.params.id === undefined ? 'local' : 'internet'}
        >
          <Avatar
            h={24}
            w={24}
            src={`https://avatars.dicebear.com/api/personas/${userInfo.id}.svg`}
          />
          <Text fontSize="xl" fontWeight="bold">
            Your name: {userInfo.nickname}
          </Text>
          {match.params.id === undefined ? (
            <>
              <Text>In local network mode</Text>
              <Button
                leftIcon={<ImEnter />}
                colorScheme="blue"
                onClick={onOpen}
              >
                Switch to internet mode
              </Button>
            </>
          ) : (
            <>
              <Text>{`Now on internet mode, room ${match.params.id}`}</Text>
              <Button
                leftIcon={<ImEnter />}
                colorScheme="blue"
                as={RouterLink}
                to="/"
              >
                Switch to local mode
              </Button>
            </>
          )}
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
          <Heading size="md" fontWeight="bold" my={3} textAlign="center">
            Online devices should appear here
          </Heading>
        )}
      </Flex>
      <ChangeRoomModal
        useInert={false}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        setConnectedPeers={setConnectedPeers}
        p2pt={p2pt}
      />
    </Flex>
  );
};
