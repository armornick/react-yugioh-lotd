
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout';
import Heading from '@/components/heading'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Yu-Gi-Oh! Card Database</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <p>Yu-Gi-Oh! is a trademark of Kazuki Takahashi, Shueisha, Konami Japan, etc. ©1996-2021. All rights reserved.</p>

      <Heading>World Championship 2008</Heading>
      <nav>
        <li> <Link href="/world-championship-2008/packs">Booster Packs</Link> </li>
      </nav>

      <hr />

      <Heading>Legacy of the Duelist</Heading>
      <nav>
        <li> <Link href="/lotd/packs">Booster Packs</Link> </li>
        <li> <Link href="/lotd/search">Card Search</Link> </li>
      </nav>

      <hr />

      <Heading>Legacy of the Duelist: Link Evolution</Heading>
      <nav>
        <li> <Link href="/link-evolution/packs">Booster Packs</Link> </li>
        <li> <Link href="/link-evolution/search">Card Search</Link> </li>
      </nav>
    </Layout>
  )
}
