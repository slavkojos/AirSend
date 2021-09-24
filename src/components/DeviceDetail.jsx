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

export const DeviceDetail = ({ icon, info }) => {
  return (
    <Flex my={1} align="center" maxWidth="300px">
      <Icon as={icon} w={12} h={12} mr={3} />
      <Heading size="lg" isTruncated fontWeight="normal">
        {info}
      </Heading>
    </Flex>
  );
};
