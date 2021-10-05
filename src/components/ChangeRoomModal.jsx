import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useClipboard,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useLocation, useHistory, Link as RouterLink } from 'react-router-dom';
import QRCode from 'qrcode.react';
import cryptoRandomString from 'crypto-random-string';
import { useEffect, useState, useRef } from 'react';
export const ChangeRoomModal = ({
  isOpen,
  onOpen,
  onClose,
  setRoomNumber,
  p2pt,
  setConnectedPeers,
}) => {
  let roomID = useRef();
  let fullUrl = window.location.href;
  const [customUrl, setCustomUrl] = useState('');
  const history = useHistory();
  useEffect(() => {
    roomID.current = cryptoRandomString({ length: 5, type: 'numeric' });
    setCustomUrl(fullUrl + roomID.current);
  }, []);

  const { hasCopied, onCopy } = useClipboard(customUrl);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="blue.900" color="gray.300">
          <ModalHeader>Share this link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" w={'100%'} align="center" justify="center">
              <Text>Scan this QR code or share the link below</Text>
              <Text fontWeight="bold">{customUrl}</Text>
              <Button onClick={onCopy} ml={2} colorScheme="blue" my={4}>
                {hasCopied ? 'Copied!' : 'Copy link'}
              </Button>
              <QRCode value={customUrl} size={240} />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                onClose();
                history.push(roomID.current);
                setConnectedPeers([]);
              }}
            >
              Switch to internet mode
            </Button>
            <Button variant="outline" colorScheme="blue" color="gray.300">
              Back to local mode
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
