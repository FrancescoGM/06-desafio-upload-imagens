import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { RegisterOptions } from 'react-hook-form';
import { AxiosResponse } from 'axios';
import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormValidations {
  image: RegisterOptions<unknown, never>;
  title: RegisterOptions<unknown, never>;
  description: RegisterOptions<unknown, never>;
}
interface FormAddImageProps {
  closeModal: () => void;
}

type PostImageData = {
  title: string;
  description: string;
  url: string;
};

interface FileList {
  name: string;
  size: number;
  type: 'image/jpeg' | 'image/png' | 'image/gif';
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  function postImage(data: PostImageData): Promise<AxiosResponse> {
    return api.post('/api/images', data);
  }

  const formValidations: FormValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: (value: FileList[]) =>
          value[0].size < 10000000 || 'O arquivo deve ser menor que 10MB',

        acceptedFormats: (value: FileList[]) =>
          /.*\/(gif|jpeg|png)$/gim.test(value[0].type) ||
          'Somente são aceitos arquivos PNG, JPEG e GIF',
      },
    },
    title: {
      required: 'Título obrigatório',
      minLength: {
        message: 'Mínimo de 2 caracteres',
        value: 2,
      },
      maxLength: {
        message: 'Máximo de 20 caracteres',
        value: 20,
      },
    },
    description: {
      required: 'Descrição obrigatória',
      maxLength: {
        message: 'Máximo de 65 caracteres',
        value: 20,
      },
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(postImage, {
    onSuccess: () => {
      queryClient.invalidateQueries('images');
    },
  });

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit: SubmitHandler<Omit<PostImageData, 'url'>> = async ({
    description,
    title,
  }): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          status: 'error',
          description:
            'É preciso adicionar e aguardar o upload de uma antes de realizar o cadastro.',
        });
        return;
      }
      await mutation.mutateAsync({ title, description, url: imageUrl });
      toast({
        title: 'Imagem cadastrada',
        status: 'success',
        description: 'Sua imagem foi cadastrada com sucesso.',
      });
    } catch {
      toast({
        title: 'Falha no cadastro',
        status: 'error',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
      });
      return;
    } finally {
      reset();
      setLocalImageUrl('');
      setImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          name="image"
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          name="title"
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          name="description"
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
