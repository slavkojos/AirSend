import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import { RiComputerLine } from 'react-icons/ri';
import { GiSmartphone } from 'react-icons/gi';
import {
  FaOpera,
  FaChrome,
  FaEdge,
  FaFirefox,
  FaSafari,
  FaUser,
} from 'react-icons/fa';
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

export const Device = ({ deviceInfo, nickname }) => {
  const determineBrowserIcon = browser => {
    console.log(browser);
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
    switch (device) {
      case 'desktop':
        return deviceInfo.os.name + ' ' + deviceInfo.os.version;
      case 'smartphone':
        return deviceInfo.device.brand + ' ' + deviceInfo.device.model;
      default:
        return deviceInfo.os.name + ' ' + deviceInfo.os.version;
    }
  };
  return (
    <Flex
      bg="#fca311"
      justifyContent="space-between"
      align="center"
      py={4}
      px={6}
      borderRadius="30px"
      h="200px"
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
      </Flex>
    </Flex>
  );
};
