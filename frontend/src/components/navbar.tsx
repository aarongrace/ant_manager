'use client'
import {CircleHelp, CogIcon} from "lucide-react"
import { usePathname } from "next/navigation";
import Link from 'next/link';
import usePlayerStatsStore from "../context/playerStatsStore";

const Navbar = () => {

    const { ants, food, sand, land, maxAnts } = usePlayerStatsStore();

    if (usePathname() === "/") {
        return <></>
    }
    return (
        <div className="w-full z-50 flex justify-between items-center border-b-2 h-12 px-3">
            <div className="flex justify-center items-center gap-2">
                <p><span className="text-orange-800">Ants:</span> {ants} {ants === maxAnts && <span className="text-red-500">MAX</span>}</p>
                |
                <p><span className="text-orange-800">Food:</span> {food}</p>
                |
                <p><span className="text-orange-800">Sand:</span> {sand}</p>
                |
                <p><span className="text-orange-800">Land:</span> {land}</p>
            </div>
            <div className="flex justify-center items-center gap-2">
                <Link href="/map" className="transition duration-300 hover:text-green-600">MAP</Link>
                <Link href="/clan" className="transition duration-300 hover:text-yellow-600">CLAN</Link>
                <Link href="/leaderboard" className="transition duration-300 hover:text-red-600">LEADERBOARD</Link>
                <Link href="/main" className="transition duration-300 hover:text-blue-600">HOME</Link>
                <Link href="/settings" className="transition-transform duration-300 hover:rotate-45"><CogIcon size={18}/></Link>
                <Link href="/guide"><CircleHelp size={18}/></Link>
            </div>
        </div>
    )
}

export default Navbar;