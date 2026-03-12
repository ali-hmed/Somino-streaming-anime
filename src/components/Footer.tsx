"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => {
    const alphabet = "0-9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ");

    return (
        <footer className="bg-footer text-[#858585] py-12 font-sans overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 max-w-[1300px]">

                {/* Top Section: A-Z List and Quick Links */}
                <div className="mb-14">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-6">
                        <h3 className="text-white text-[20px] font-bold tracking-tight">A-Z List</h3>
                        <p className="text-[13px] font-medium opacity-60">Searching anime order by alphabet name A to Z.</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-y-6">
                        {/* A-Z Buttons */}
                        <div className="flex flex-wrap gap-1.5">
                            <Link href="/az-list" className="px-3 py-1 bg-card hover:bg-primary hover:text-black transition-all text-[12px] font-bold rounded-[4px] min-w-[36px] text-center text-white">
                                All
                            </Link>
                            {alphabet.map((letter) => (
                                <Link
                                    key={letter}
                                    href={`/az-list/${letter === '0-9' ? '0-9' : letter}`}
                                    className="px-2 py-1 bg-card hover:bg-primary hover:text-black transition-all text-[12px] font-bold rounded-[4px] min-w-[28px] text-center text-white"
                                >
                                    {letter}
                                </Link>
                            ))}
                        </div>

                        {/* Quick Actions (Far Right) */}
                        <div className="flex items-center gap-6 md:ml-auto">
                            <Link href="/request" className="text-[13px] font-black tracking-tight text-white hover:text-primary transition-colors">
                                request
                            </Link>
                            <Link href="/contact" className="text-[13px] font-black tracking-tight text-white hover:text-primary transition-colors">
                                contact us
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Info and Logo */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    {/* Left: Branding and Legal */}
                    <div className="space-y-4 max-w-2xl">
                        <div className="space-y-1">
                            <p className="text-[13px] font-bold text-white/90">
                                Copyright © Somino. All Rights Reserved
                            </p>
                            <p className="text-[12px] leading-relaxed text-white/30 font-medium">
                                This site does not store any files on its server. All contents are provided by non-affiliated third parties.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-white/40">Socials:</span>
                                <div className="flex items-center gap-3">
                                    <Link href="#" className="opacity-60 hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.572.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0s.073-.01.077-.01a.077.077 0 0 1 .127.008c.163.26.331.52.505.77a.077.077 0 0 1-.041.106 14.1 14.1 0 0 0 1.226 1.994.078.078 0 0 0 .084-.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                                    </Link>
                                    <Link href="#" className="opacity-60 hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.051l-2.597-.547-.8 3.747c1.824.103 3.48.555 4.85 1.259.348-.344.829-.556 1.359-.556.96 0 1.741.78 1.741 1.74 0 .61-.316 1.141-.791 1.453a5.23 5.23 0 0 1 .051.716c0 2.822-3.397 5.12-7.585 5.12s-7.585-2.298-7.585-5.12c0-.245.033-.484.095-.715a1.74 1.74 0 0 1-.759-1.454c0-.96.781-1.74 1.741-1.74.527 0 1.007.235 1.359.579 1.37-.704 3.026-1.156 4.85-1.259l.885-4.139a.254.254 0 0 1 .28-.198l2.907.612zm-7.51 7.234c-.78 0-1.409.63-1.409 1.408 0 .779.629 1.408 1.408 1.408.779 0 1.409-.629 1.409-1.408 0-.779-.63-1.408-1.409-1.408zm4.998 0c-.78 0-1.409.63-1.409 1.408 0 .779.629 1.408 1.408 1.408.779 0 1.409-.629 1.409-1.408 0-.779-.63-1.408-1.409-1.408zm-2.498 3.659c-1.093 0-1.978.885-1.978 1.978 0 .141.115.253.253.253.142 0 .253-.112.253-.253 0-.814.663-1.472 1.472-1.472.81 0 1.472.658 1.472 1.472 0 .141.112.253.253.253.142 0 .253-.112.253-.253 0-1.093-.885-1.978-1.978-1.978z" /></svg>
                                    </Link>
                                </div>
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-white/40">Links:</span>
                                <div className="flex flex-wrap items-center gap-x-1 text-[12px] font-medium text-white/40">
                                    <Link href="#" className="hover:text-primary transition-colors">somino.to,</Link>
                                    <Link href="#" className="hover:text-primary transition-colors">sflix,</Link>
                                    <Link href="#" className="hover:text-primary transition-colors">watch anime</Link>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Right: Real Logo */}
                    <div className="flex flex-col items-end pb-1 pr-1">
                        <Link href="/" className="flex items-center opacity-90 hover:opacity-100 transition-all cursor-pointer group">
                            <img
                                src="/Somino-lg.png"
                                alt="Somino Logo"
                                className="h-8 md:h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
