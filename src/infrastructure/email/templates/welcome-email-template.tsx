import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailProps> = ({ name }) => {
  const previewText = `Bem-vindo, ${name}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-xl bg-white px-8 py-10 my-10 rounded-lg shadow-lg">
            <Section className="text-center mb-8">
              <Heading className="text-3xl font-bold text-emerald-600 m-0">
                POC API
              </Heading>
            </Section>

            <Section className="mb-6">
              <Heading className="text-2xl font-semibold text-gray-800 mb-4">
                Olá, {name}! 👋
              </Heading>
              <Text className="text-gray-600 text-base leading-relaxed">
                Seja muito bem-vindo(a) à <strong>POC API</strong>! Estamos
                muito felizes em tê-lo(a) conosco.
              </Text>
              <Text className="text-gray-600 text-base leading-relaxed">
                Sua conta foi criada com sucesso e você já pode começar a
                explorar todas as funcionalidades da nossa plataforma.
              </Text>
            </Section>

            <Section className="text-center mb-8">
              <Button
                href="https://google.com"
                className="bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg no-underline inline-block"
              >
                Acessar Minha Conta
              </Button>
            </Section>

            <Section className="border-t border-gray-200 pt-6">
              <Text className="text-gray-500 text-sm text-center m-0">
                Se você não criou esta conta, por favor ignore este email.
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-4">
                © {new Date().getFullYear()} POC API. Todos os direitos
                reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
