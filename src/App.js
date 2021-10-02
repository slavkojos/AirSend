import React from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  Flex,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import { Home } from './pages/Home';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl" h="100%">
        <Flex direction="column">
          <Home />
        </Flex>
      </Box>
    </ChakraProvider>
  );
}

export default App;
