import { Application } from "@/types";
import { Product } from "@/types/product";
import { User } from "@supabase/supabase-js";
import { useCallback, useMemo, useState } from "react";
import { AppContext } from "./AppContext";

export default function AppContextProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [session, setSession] = useState<User | null>(null);
    const [app, setApp] = useState<Application | null>(null)

    // =============== Set Products ===============
    const pushProducts = useCallback((fetchedProducts: Product[] | null): void => {
        // Check -- Whether fetchedProducts is there or not if yes -->
        if (fetchedProducts) {
            // Check -- Product State has some products.
            if (products.length === 0) {
                setProducts(fetchedProducts);
            } else {
                setProducts((prev) => {
                    return prev.concat(fetchedProducts);
                })
            }
        }
    }, [products.length]);

    // =============== Insert Products ===============
    const insertProducts = useCallback((fetchedProducts: Product[] | null) => {
        if (fetchedProducts) {
            setProducts(fetchedProducts);
        } else {
            setProducts([])
        }
    }, [setProducts]);

    // =============== Update Product ===============
    const updateProduct = useCallback((id: string | string[], updateValue: Partial<Product>) => {
        setProducts(prevProducts => {
            return prevProducts.map(product => {
                if (!Array.isArray(id) ? product.id === id : id.includes(product.id)) {
                    return { ...product, ...updateValue };
                }
                return product;
            });
        });
    }, []);


    // =============== Get Product By Id ===============
    const getProductById = useCallback(<T extends string | string[]>(id: T): T extends string[] ? Product[] : Product | null => {
        if (Array.isArray(id)) {
            const foundProducts = id.map((i) => {
                const product = products.find(p => p.id === i);
                return product || null;
            }).filter(p => p !== null);

            return foundProducts as any;
        } else {
            if (id === '') return null as any;
            return (products.find(p => p.id === id) || null) as any;
        }
    }, [products]);

    // =============== Add Session ===============
    const addSession = useCallback((session: User | null) => {
        setSession(session)
    }, []);

    // =============== Delete Product ===============
    const deleteProduct = useCallback((id: string | string[]) => {
        // Function that filter the product.
        const filterProduct = (product: Product) => {
            return Array.isArray(id) ? !id.includes(product.id) : product.id !== id;
        }

        setProducts(prevProducts => prevProducts.filter(filterProduct));
    }, []);

    // =============== Add App Data ===============
    const addAppData = useCallback((appData: Application) => {
        setApp(appData)
    }, []);

    const contextValue = useMemo(() => ({
        app,
        session,
        products,
        pushProducts,
        insertProducts,
        addSession,
        addAppData,
        deleteProduct,
        updateProduct,
        getProductById
    }), [app, session, products, pushProducts, insertProducts, addSession, addAppData, deleteProduct, updateProduct, getProductById]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}