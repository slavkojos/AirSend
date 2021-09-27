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

export const DeviceDetail = ({ icon, info, fontSize, maxWidth }) => {
  return (
    <Flex my={2} align="center" maxWidth={maxWidth}>
      <Icon as={icon} w={10} h={10} mr={2} />
      <Heading size={fontSize} isTruncated fontWeight="normal">
        {info}
      </Heading>
    </Flex>
  );
};
