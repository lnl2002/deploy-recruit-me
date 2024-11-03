import Image from 'next/image'
import React from 'react'

const Empty = () => {
  return (
    <div className='text-themeDark min-h-96 w-full flex items-center justify-center'>
        <div className='flex flex-col items-center'>
            <Image alt='Empty' src="../empty.svg" width={100} height={100}/>
            <div className='font-bold text-[20px]'>There are currently no applications</div>
            <div>We are still acceptiong applications. Please check back frequently for updates.</div>
        </div>
    </div>
  )
}

export default Empty