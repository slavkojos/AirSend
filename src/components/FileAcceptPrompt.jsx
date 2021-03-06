import { Text, Flex, Button, CloseButton } from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

export const FileAcceptPrompt = ({
  fileName,
  fileSize,
  user,
  peer,
  close,
  prepareToRecieve,
  rejectFile,
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
      maxWidth="550px"
      align="stretch"
      color="black"
    >
      <Flex direction="column" width="100%">
        <Text fontSize="lg">{`${user} is sending you this:`}</Text>
        <Text as="i" isTruncated maxWidth="90%">{`${fileName}`}</Text>
        <Text fontWeight="bold">{`${(fileSize / 1048576).toFixed(2)} MB`}</Text>
        <Flex justify="space-between" align="center" my={1}>
          <Button
            leftIcon={<FaCheck />}
            colorScheme="green"
            variant="solid"
            onClick={() => {
              prepareToRecieve(peer, fileName, fileSize);
              close();
            }}
          >
            Accept
          </Button>
          <Button
            leftIcon={<MdCancel />}
            colorScheme="red"
            variant="solid"
            onClick={() => {
              rejectFile(peer);
              close();
            }}
          >
            Reject
          </Button>
        </Flex>
      </Flex>
      <CloseButton fontSize="12px" onClick={close} />
    </Flex>
  );
};
