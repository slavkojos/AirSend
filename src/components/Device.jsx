import {
  Box,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { RiComputerLine } from 'react-icons/ri';
import { GiSmartphone } from 'react-icons/gi';
import { IoMdText } from 'react-icons/io';
import {
  FaOpera,
  FaChrome,
  FaEdge,
  FaFirefox,
  FaSafari,
  FaUser,
} from 'react-icons/fa';
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
  chatMessage,
  setChatMessage,
  peer,
}) => {
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
      bg="#fca311"
      justifyContent="space-between"
      align="center"
      py={4}
      px={4}
      borderRadius="30px"
      h="250px"
      my={2}
      cursor="pointer"
      width="350px"
    >
      <Flex direction="column">
        <DeviceDetail icon={FaUser} info={nickname} />
        <DeviceDetail
          icon={determineDeviceIcon(deviceInfo.device.type)}
          info={determineDevice(deviceInfo.device.type)}
        />
        <DeviceDetail
          icon={determineBrowserIcon(deviceInfo.client.name)}
          info={deviceInfo.client.name + ' ' + deviceInfo.client.version}
        />
        <Flex align="center" my={2} justify="space-between">
          <Icon as={IoMdText} w={10} h={10} mr={3} />
          <Input
            variant="flushed"
            placeholder="Send your message here"
            _placeholder={{ color: 'black' }}
            width="100%"
            size="lg"
            onChange={e => setChatMessage(e.target.value)}
          />
          <Icon
            as={MdSend}
            w={10}
            h={10}
            mx={3}
            onClick={() => sendMessage(peer)}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
