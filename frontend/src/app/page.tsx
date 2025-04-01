import Head from 'next/head'

const Home = () => {
  return (
    <>
    <Head>
      <title>Clash of Colonies</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <div className="h-screen flex items-center justify-start flex-col">
      <img src="/logo.png" alt="Logo" draggable={false} className="h-80 w-80 mt-10 select-none" />
      <h4 className="text-center font-bold text-2xl">Build your ant empire and rise to the top of the leaderboard by joining forces with other places in clans, conquer land and grow your ant army!</h4>
    </div>
    </>
  )
}

export default Home;