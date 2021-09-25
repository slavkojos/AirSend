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
} from '@chakra-ui/react';

export const ChatMessage = ({ message, user, peer }) => {
  return (
    <Box bg="yellow">
      {message} by {user}
    </Box>
  );
};
