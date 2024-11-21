import Image from "next/image";
export default function Layout({}) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-[80px] bg-white z-40 sticky top-0">
      <div className="w-full xl:px-24 sm:px-8 flex font-semibold justify-between items-center py-3 text-sm">
        <div className=" mx-5 w-[70px] h-auto">
          <Image
            className=""
            src="/logolms.png"
            alt="Next.js logo"
            width={300}
            height={300}
          />
        </div>
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
                  className="dark"
                  src="https://nextjs.org/icons/next.svg"
                  alt="Next.js logo"
                  width={90}
                  height={18}
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
