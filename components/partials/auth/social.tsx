import { signIn } from "@/lib/auth";
import Image from "next/image";

const Social = ({ locale }: { locale: string }) => {
  return (
    <>
      <ul className="flex">
        <li className="flex-1">
          <a
            href="#"
            className="inline-flex h-10 w-10 p-2 bg-[#00BCF2] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={300} height={300} className="w-full h-full" src="/images/icon/Microsoft_logo.png" alt="" />
          </a>
        </li>
        <li className="flex-1">
          <a
            href="#"
            className="inline-flex h-10 w-10 p-2 bg-[#0A63BC] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={300} height={300} className="w-full h-full" src="/images/icon/in.svg" alt="" />
          </a>
        </li>
        <li className="flex-1">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: `/${locale}/dashboard/analytics` });
            }}
          >
            <button type="submit" className="inline-flex h-10 w-10 p-2 bg-[#EA4335] text-white text-2xl flex-col items-center justify-center rounded-full">
              <Image width={300} height={300} className="w-full h-full" src="/images/icon/gp.svg" alt="" />
            </button>
          </form>
        </li>
      </ul>
    </>
  );
};

export default Social;