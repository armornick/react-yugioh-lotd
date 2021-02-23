
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout';
// import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <p>Yu-Gi-Oh! is a trademark of Kazuki Takahashi, Shueisha, Konami Japan, etc. ©1996-2021. All rights reserved.</p>

      <h2>Legacy of the Duelist</h2>
      <nav>
        <li> <Link href="/lotd/packs">Booster Packs</Link> </li>
        <li> <Link href="/lotd/search">Card Search</Link> </li>
      </nav>
    </Layout>
  )
}
