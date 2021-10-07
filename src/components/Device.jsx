import { Flex, Icon, Input, Button, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { RiComputerLine } from 'react-icons/ri';
import { GiSmartphone } from 'react-icons/gi';
import { IoMdText } from 'react-icons/io';
import { FaOpera, FaChrome, FaEdge, FaFirefox, FaSafari } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';
import './Device.css';
import { DeviceDetail } from './DeviceDetail';
const determineDeviceIcon = deviceType => {
  switch (deviceType) {
    case 'desktop':
      return RiComputerLine;
    case 'smartphone':
      return GiSmartphone;
    default:
      return RiComputerLine;
  }
};

export const Device = ({
  deviceInfo,
  nickname,
  sendMessage,
  peer,
  handleUploadFile,
  inputFile,
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isButtonDisabled, setDisabled] = useState(false);

  const determineBrowserIcon = browser => {
    if (browser.toLowerCase().includes('chrome')) {
      return FaChrome;
    } else if (browser.toLowerCase().includes('opera')) {
      return FaOpera;
    } else if (browser.toLowerCase().includes('edge')) {
      return FaEdge;
    } else if (browser.toLowerCase().includes('firefox')) {
      return FaFirefox;
    } else if (browser.toLowerCase().includes('safari')) {
      return FaSafari;
    } else {
      return FaChrome;
    }
  };
  const determineDevice = device => {
    if (device === 'desktop' && deviceInfo.os.name !== '') {
      return deviceInfo.os.name + ' ' + deviceInfo.os.version;
    } else if (device === 'smartphone' && deviceInfo.device.brand !== '') {
      return deviceInfo.device.brand + ' ' + deviceInfo.device.model;
    } else {
      return 'Unknown';
    }
  };

  return (
    <Flex
      className="device"
      py={4}
      px={4}
      borderRadius="2xl"
      my={2}
      cursor="pointer"
      minWidth="320px"
      maxWidth="750px"
      maxHeight="300px"
    >
      <Flex direction="column" justify="space-between" width="100%">
        <DeviceDetail
          maxWidth="100%"
          icon={`https://avatars.dicebear.com/api/personas/${peer.id}.svg`}
          info={nickname}
          fontSize="lg"
        />
        <Flex justify="space-between" align="center">
          <DeviceDetail
            maxWidth="75%"
            fontSize="xs"
            icon={determineDeviceIcon(deviceInfo.device.type)}
            info={determineDevice(deviceInfo.device.type)}
          />
          <DeviceDetail
            maxWidth="75%"
            fontSize="xs"
            icon={determineBrowserIcon(deviceInfo.client.name)}
            info={deviceInfo.client.name + ' ' + deviceInfo.client.version}
          />
        </Flex>

        <Flex align="center" my={2} justify="space-between">
          <Icon as={IoMdText} w={10} h={10} mr={3} />
          <Input
            variant="flushed"
            placeholder="Send your message here"
            _placeholder={{ color: 'gray.300' }}
            width="100%"
            size="lg"
            onChange={e => setChatMessage(e.target.value)}
            value={chatMessage}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value !== '') {
                sendMessage(peer, chatMessage);
                setChatMessage('');
              }
            }}
          />
          <IconButton
            icon={<MdSend />}
            variant="outline"
            colorScheme="cyan"
            fontSize="20px"
            mx={3}
            onClick={() => {
              sendMessage(peer, chatMessage);
              setChatMessage('');
            }}
          />
        </Flex>
        <Input
          type="file"
          style={{ display: 'none' }}
          ref={inputFile}
          onChange={e => {
            handleUploadFile(peer, e.target.files[0]);
            setDisabled(false);
          }}
        />
        <Button
          disabled={isButtonDisabled}
          my={2}
          colorScheme="blue"
          size="md"
          onClick={() => {
            inputFile.current.click();
            //setDisabled(true);
          }}
        >
          Click here to send a file
        </Button>
      </Flex>
    </Flex>
  );
};
