import { Flex, Heading, Icon, Avatar } from '@chakra-ui/react';

export const DeviceDetail = ({ icon, info, fontSize, maxWidth }) => {
  return (
    <Flex my={2} align="center" maxWidth={maxWidth}>
      {fontSize === 'lg' ? (
        <Avatar src={icon} w={14} h={14} mr={2} />
      ) : (
        <Icon as={icon} w={10} h={10} mr={1} />
      )}

      <Heading size={fontSize} isTruncated fontWeight="normal" mr={3}>
        {info}
      </Heading>
    </Flex>
  );
};
