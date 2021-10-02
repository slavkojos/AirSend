import { Box, Flex, Heading, Icon, Avatar } from '@chakra-ui/react';
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
      {fontSize === 'lg' ? (
        <Avatar src={icon} w={14} h={14} mr={2} />
      ) : (
        <Icon as={icon} w={10} h={10} mr={2} />
      )}

      <Heading size={fontSize} isTruncated fontWeight="normal">
        {info}
      </Heading>
    </Flex>
  );
};
