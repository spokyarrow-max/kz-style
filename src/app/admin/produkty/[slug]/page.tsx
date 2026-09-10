import { notFound } from "next/navigation";
import { getAdminProductBySlug } from "@/lib/admin/products";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminVariantRow } from "@/components/admin-variant-row";

export default async function AdminProductEditPage(props: PageProps<"/admin/produkty/[slug]">) {
  const { slug } = await props.params;
  const product = await getAdminProductBySlug(slug);
  if (!product) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">{product.slug}</p>
      <h2 className="mt-1 font-display text-2xl font-bold uppercase text-stone-100">
        {product.name}
      </h2>

      <div className="mt-8">
        <AdminProductForm product={product} />
      </div>

      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Warianty i stan magazynowy
        </p>
        <div className="mt-4">
          {product.variants.map((variant) => (
            <AdminVariantRow key={variant.id} variant={variant} slug={product.slug} />
          ))}
        </div>
      </div>
    </div>
  );
}
