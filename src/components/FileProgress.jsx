import { Text, Flex, Button, CloseButton, Progress } from '@chakra-ui/react';
import { MdCancel } from 'react-icons/md';
import { IoIosSpeedometer } from 'react-icons/io';

export const FileProgress = ({
  fileName,
  fileSize,
  close,
  progress,
  transferSpeed,
  transfer,
}) => {
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
        <Text>{`${fileName},(${(fileSize / 1048576).toFixed(2)} MB)`}</Text>
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
              leftIcon={<IoIosSpeedometer />}
              colorScheme="teal"
              variant="solid"
            >
              {(transferSpeed / 1048576).toFixed(2)} MB/s
            </Button>
            <Button
              leftIcon={<MdCancel />}
              colorScheme="red"
              variant="solid"
              onClick={() => {
                transfer.cancel();
                close();
              }}
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
