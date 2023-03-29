import Link from 'next/link';
import Loader from '@/components/Loader';
import { toast } from 'react-hot-toast';
import { Text, Spacer } from '@nextui-org/react';
import NavigationBar from '@/components/NavigationBar';

export default function Home() {
  return (
    <>
      <Text h2>Hello</Text>
      <Spacer y={1} />
    </>
  );
}
