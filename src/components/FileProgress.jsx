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
  Progress,
} from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { useState } from 'react';
import { IoIosSpeedometer } from 'react-icons/io';

export const FileProgress = ({
  fileName,
  fileSize,
  user,
  peer,
  close,
  prepareToRecieve,
  progress,
  toastProgressId,
  transferSpeed,
}) => {
  console.log('progress in fileprogress: ' + progress);
  console.log('toastProgressId in fileprogress: ' + toastProgressId);
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
        <Text>
          {fileName},{fileSize}
        </Text>
        <Flex my={1} direction="column" justify="flex-start" align="flex-start">
          <Progress
            colorScheme="green"
            height="16px"
            value={Math.round(progress)}
            width="80%"
            max={100}
            min={0}
            mr={3}
            borderRadius="md"
          />
          <Text>{Math.round(progress)}%</Text>
          <Flex>
            <Button
              leftIcon={IoIosSpeedometer}
              colorScheme="teal"
              variant="solid"
            >
              {(transferSpeed / 1048576).toFixed(2)} MB/s
            </Button>
            <Button
              leftIcon={<MdCancel />}
              colorScheme="red"
              variant="solid"
              onClick={close}
            >
              Cancel transfer
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <CloseButton fontSize="12px" onClick={close} />
    </Flex>
  );
};
