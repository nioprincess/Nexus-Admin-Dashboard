import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white shadow-inner text-center p-4">
      <p className="text-sm text-gray-500">© {new Date().getFullYear()} Nexus Admin. All rights reserved.</p>
    </footer>
  )
}

export default Footer
