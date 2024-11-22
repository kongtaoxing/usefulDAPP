import SolanaProvider from "@/components/providers/solanaProvider";

export default function SolanaCloseAccountLayout({
  children,
}) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
