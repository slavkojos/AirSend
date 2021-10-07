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
  Button,
  IconButton,
  Icon,
  CloseButton,
  useClipboard,
} from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';
import { RiMessage2Fill } from 'react-icons/ri';

export const ChatMessage = ({ message, user, peer, close }) => {
  const { hasCopied, onCopy } = useClipboard(message);
  return (
    <Flex
      maxHeight="300px"
      px={4}
      py={2}
      pr={1}
      bg={'orange.300'}
      borderRadius="10px"
      justify="space-between"
      maxWidth="500px"
      align="stretch"
    >
      <Flex direction="column">
        <Flex justify="flex-start" align="center" my={1}>
          <Icon as={FaUser} mr={2} />
          <Text>{user}</Text>
        </Flex>
        <Flex justify="flex-start" align="center" my={1}>
          <Icon as={RiMessage2Fill} mr={2} />
          <Text>{message}</Text>
        </Flex>
        <Button
          colorScheme="blue"
          onClick={onCopy}
          maxWidth="200px"
          p={2}
          my={2}
        >
          {hasCopied ? 'Copied' : 'Copy message'}
        </Button>
      </Flex>
      <CloseButton fontSize="12px" onClick={close} />
    </Flex>
  );
};
