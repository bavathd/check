"use client"
import dynamic from 'next/dynamic'


const Model = dynamic(

  () => import('../../components/model'),

  { ssr: false }
)

export default function Home() {
  
    return (
      <div className="2x:container flex justify-center items-center h-screen	overflow-hidden">
          <Model className="w-96 h-96"/>
      </div>
    );
  
}
