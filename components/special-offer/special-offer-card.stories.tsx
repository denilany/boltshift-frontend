import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SpecialOfferCard } from "@/components/special-offer/special-offer-card";
import { Toaster } from "@/components/ui/sonner";
import { GetProductItems } from "@/lib/product-items";

const [storyProduct] = GetProductItems();

function SpecialOfferCardCanvas() {
  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SpecialOfferCard product={storyProduct} />
      </div>
      <Toaster />
    </div>
  );
}

const meta = {
  title: "Components/SpecialOffer/SpecialOfferCard",
  component: SpecialOfferCard,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SpecialOfferCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { product: storyProduct },
  render: () => <SpecialOfferCardCanvas />,
};
