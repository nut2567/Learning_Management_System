import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Courses" },
  { href: "/manage", label: "Manage" },
  { href: "/about", label: "About" },
];

export default function Layout() {
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
          {navItems.map((item) => (
            <Link
              className="text-gray-700 transition hover:text-blue-600"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <div className="flex justify-center items-center w-full">
            {" "}
            powered by
            <div className=" mx-auto">
              <a
                href="https://nextjs.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video min-h-4"
              >
                {/* <NextLogo /> */}
                <Image
                  className="dark"
                  src="/nextjs-logo.webp"
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
