import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [selectedImage, setSelectedImage] = useState('');

  function viewImage(url: string): void {
    setSelectedImage(url);
    onOpen();
  }

  function handleClose(): void {
    setSelectedImage('');
    onClose();
  }

  return (
    <>
      <SimpleGrid spacing="40px" maxW={1120} minChildWidth="293px">
        {cards.map(card => (
          <Card data={card} viewImage={viewImage} />
        ))}
      </SimpleGrid>
      {selectedImage && (
        <ModalViewImage
          imgUrl={selectedImage}
          isOpen={isOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
}
