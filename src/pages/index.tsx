import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

type Card = {
  id: string;
  ts: number;
  url: string;
  title: string;
  description: string;
};

type GetCardsResponse = {
  data: Card[];
  after: number | null;
};

type GetCardsProps = {
  pageParam?: number | null;
};

export default function Home(): JSX.Element {
  async function getCards({
    pageParam = null,
  }: GetCardsProps): Promise<GetCardsResponse> {
    const { data } = await api.get<GetCardsResponse>('/api/images', {
      params: { after: pageParam },
    });
    return data;
  }
  function getNextPageParam(cards: GetCardsResponse): number | null {
    return cards.after || null;
  }
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<GetCardsResponse>('images', getCards, {
    getNextPageParam,
  });

  const formattedData = useMemo(() => {
    if (data) {
      return data.pages[0].data || [];
    }
    return [];
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {/* TODO RENDER LOAD MORE BUTTON IF DATA HAS NEXT PAGE */}
      </Box>
    </>
  );
}
