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
import GithubCorner from 'react-github-corner';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
} from 'react-router-dom';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Route path="/:id?" component={Home} exact />
      </Router>
      <GithubCorner
        direction="left"
        href="https://github.com/slavkojos/AirSend"
        target="_blank"
      />
    </ChakraProvider>
  );
}

export default App;
