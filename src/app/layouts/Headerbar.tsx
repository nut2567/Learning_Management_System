"use client";
import Image from "next/image";
export default function Layout({}) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-black z-40 sticky top-0">
      <div className="w-full pl-24 flex font-semibold justify-between items-center p-3 text-sm">
        <div className="flex gap-5">
          <p>Portfolio</p>
          <p>Nutthawat Witdumring</p>
        </div>

        <div>
          <div className="flex justify-center items-center w-full">
            {" "}
            powered by
            <div className=" mx-5">
              <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
                {/* <NextLogo /> */}
                <Image
                  className="dark:invert"
                  src="https://nextjs.org/icons/next.svg"
                  alt="Next.js logo"
                  width={90}
                  height={18}
                  priority
                />
              </a>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </nav>
  );
}