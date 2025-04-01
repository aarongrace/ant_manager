import Link from 'next/link'
import {CircleHelp} from 'lucide-react';

// IF USER IS AUTHENTICATED WE WANT TO REDIRECT TO THEIR PROFILE INSTEAD OF LANDING PAGE
const Landing = () => {
  return (
    <>
    <div className="h-screen flex items-center justify-center flex-col">
        <img src="/logo.png" alt="Logo" draggable={false} className="h-80 w-80 select-none" />
        <div className="flex justify-center gap-10 items-center">
          <Link href="/main" className="bg-green-600 p-3 transition duration-300 hover:bg-green-700 hover:border-black border-zinc-900 border-3 flex justify-center items-center text-zinc-50 rounded-md"><p>Play Now</p></Link>
          <Link href="/guide" className="bg-red-600 p-3 transition duration-300 hover:bg-red-700 hover:border-black border-zinc-900 border-3 flex justify-center items-center text-zinc-50 rounded-md gap-1"><p className="align-middle">Guide</p><CircleHelp size={20}/></Link>
        </div>
    </div>
    </>
  )
}

export default Landing;