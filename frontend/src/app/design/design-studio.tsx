"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
// AI functions will be called via API
import { AIService } from '@/lib/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, User, ShoppingCart, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { calculateItemPrice, getPriceDisplay, getPriceBreakdown, getAvailableColors } from '@/lib/config/pricing';
import { Switch } from "@/components/ui/switch";
import React from 'react';


const designFormSchema = z.object({
  prompt: z.string().min(10, { message: "Please enter a prompt of at least 10 characters." }),
  category: z.enum(['male', 'female']),
  clothingType: z.string({ required_error: "Please select a clothing type." }),
  clothingColor: z.string({ required_error: "Please select a color." }),
  style: z.enum(['modern', 'vintage', 'abstract'], { required_error: "Please select a style." }),
  printLocation: z.enum(['front', 'back', 'full-coverage', 'custom'], { required_error: "Please select a print location." }),
  includeLogo: z.boolean().default(false),
});

type DesignFormValues = z.infer<typeof designFormSchema>;

const TshirtIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
);

const PoloIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
        <path d="M12 2L10 6.5h4L12 2z"></path>
        <path d="M12 6.5V9"></path>
    </svg>
);

const HoodieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"/><path d="M12 2l-3 3v4h6V5l-3-3Z"/><path d="M6 10H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2"/></svg>
);

const ZipHoodieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"/>
        <path d="M12 2l-3 3v4h6V5l-3-3Z"/>
        <path d="M6 10H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2"/>
        <path d="M12 11v11"/>
    </svg>
);

const SweatshirtIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
);

const QuarterZipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        <path d="M12 9V13" />
        <path d="M11 9h2" />
    </svg>
);

const FullSleeveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        <path d="M8 6h8" />
        <path d="M8 10h8" />
    </svg>
);

const DryFitIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        <path d="M12 2L10 6.5h4L12 2z"/>
        <path d="M12 6.5V9"/>
        <path d="M8 12h8"/>
    </svg>
);

const AcidWashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        <path d="M8 8h8"/>
        <path d="M8 12h8"/>
        <path d="M8 16h8"/>
    </svg>
);

const StripePoloIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        <path d="M12 2L10 6.5h4L12 2z"/>
        <path d="M12 6.5V9"/>
        <path d="M8 10h8"/>
        <path d="M8 14h8"/>
    </svg>
);

const DressIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L8 6v12l4 4 4-4V6l-4-4z"/>
        <path d="M8 6h8"/>
        <path d="M8 10h8"/>
        <path d="M8 14h8"/>
    </svg>
);

const OversizedTshirtIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
        <path d="M6 8h12"/>
        <path d="M6 12h12"/>
    </svg>
);

const CropHoodieIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"/>
        <path d="M12 2l-3 3v4h6V5l-3-3Z"/>
        <path d="M6 10H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/>
        <path d="M8 16h8"/>
    </svg>
);

const clothingTypes = [
    // Male category - All clothing types from pricing config
    { id: 'male-half-sleeves-t-shirt', label: 'Half Sleeves T-Shirt', icon: TshirtIcon, category: 'male' },
    { id: 'male-full-sleeves-t-shirt', label: 'Full Sleeves T-Shirt', icon: FullSleeveIcon, category: 'male' },
    { id: 'male-polo-half-sleeves', label: 'Polo Half Sleeves', icon: PoloIcon, category: 'male' },
    { id: 'male-dry-fit-polo', label: 'Dry-Fit Polo', icon: DryFitIcon, category: 'male' },
    { id: 'male-acid-wash-t-shirt', label: 'Acid Wash T-Shirt', icon: AcidWashIcon, category: 'male' },
    { id: 'male-stripe-polo-t-shirt', label: 'Stripe Polo T-Shirt', icon: StripePoloIcon, category: 'male' },
    
    // Female category - All clothing types from pricing config
    { id: 'female-half-sleeves-t-shirt', label: 'Half Sleeves T-Shirt', icon: TshirtIcon, category: 'female' },
    { id: 'female-crop-top', label: 'Crop Top', icon: TshirtIcon, category: 'female' },
    { id: 'female-cropped-hoodies', label: 'Cropped Hoodies', icon: CropHoodieIcon, category: 'female' },
    { id: 'female-t-shirt-dress', label: 'T-Shirt Dress', icon: DressIcon, category: 'female' },
    
    // Unisex category - Available for both male and female
    { id: 'unisex-hip-hop-oversized-t-shirt', label: 'Hip Hop Oversized T-Shirt', icon: OversizedTshirtIcon, category: 'unisex' },
    { id: 'unisex-hoodies', label: 'Hoodies', icon: HoodieIcon, category: 'unisex' },
    { id: 'unisex-sweatshirt', label: 'Sweatshirt', icon: SweatshirtIcon, category: 'unisex' },
];

// Mapping from design studio clothing types to pricing config clothing types
const clothingTypeMapping: Record<string, string> = {
    // Male clothing types
    'male-half-sleeves-t-shirt': 'men-half-sleeves-t-shirt',
    'male-full-sleeves-t-shirt': 'men-full-sleeves-t-shirt',
    'male-polo-half-sleeves': 'men-polo-half-sleeves',
    'male-dry-fit-polo': 'men-dry-fit-polo',
    'male-acid-wash-t-shirt': 'men-acid-wash-t-shirt',
    'male-stripe-polo-t-shirt': 'men-stripe-polo-t-shirt',
    
    // Female clothing types
    'female-half-sleeves-t-shirt': 'women-half-sleeves-t-shirt',
    'female-crop-top': 'women-crop-top',
    'female-cropped-hoodies': 'women-cropped-hoodies',
    'female-t-shirt-dress': 'women-t-shirt-dress',
    
    // Unisex clothing types
    'unisex-hip-hop-oversized-t-shirt': 'unisex-hip-hop-oversized-t-shirt',
    'unisex-hoodies': 'unisex-hoodies',
    'unisex-sweatshirt': 'unisex-sweatshirt',
};

// Comprehensive color mapping with hex values
const colorHexMapping: Record<string, string> = {
    'white': '#FFFFFF',
    'black': '#000000',
    'light-gray': '#D3D3D3',
    'dark-gray': '#696969',
    'red': '#FF0000',
    'light-blue': '#ADD8E6',
    'dark-blue': '#00008B',
    'navy': '#000080',
    'royal-blue': '#4169E1',
    'medium-blue': '#0000CD',
    'light-green': '#90EE90',
    'olive-green': '#808000',
    'lime-green': '#32CD32',
    'dark-green': '#006400',
    'yellow': '#FFFF00',
    'light-yellow': '#FFFFE0',
    'gold': '#FFD700',
    'pink': '#FFC0CB',
    'light-pink': '#FFB6C1',
    'light-purple': '#DDA0DD',
    'dark-purple': '#800080',
    'orange': '#FFA500',
    'dark-brown': '#8B4513',
    'tan': '#D2B48C',
    'maroon': '#800000',
    'teal': '#008080',
    'dark-teal': '#006666',
    'light-peach': '#FFDAB9',
};

// Get colors for a specific clothing type
function getColorsForClothingType(clothingType: string) {
    const mappedType = clothingTypeMapping[clothingType] || 'men-half-sleeves-t-shirt';
    const availableColors = getAvailableColors(mappedType);
    
    return availableColors.map(colorId => ({
        id: colorId,
        name: colorId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        hex: colorHexMapping[colorId] || '#FFFFFF'
    }));
}

export default function DesignStudio() {
    const [isLoading, setIsLoading] = useState(false);
    const [updatingIdea, setUpdatingIdea] = useState<string | null>(null);
    const [designIdeas, setDesignIdeas] = useState<string[]>([]);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [virtualTryOnImages, setVirtualTryOnImages] = useState<{ front: string; side: string; back: string } | null>(null);
    const [selectedSize, setSelectedSize] = useState('M');
    const [customPrintLocation, setCustomPrintLocation] = useState('');
    const [showLogoOnPreview, setShowLogoOnPreview] = useState(false);
    const { toast } = useToast();
    const { addToCart } = useCart();

    const isUpdatingImage = updatingIdea !== null;

    const form = useForm<DesignFormValues>({
        resolver: zodResolver(designFormSchema),
        defaultValues: {
            prompt: '',
            category: 'male',
            clothingType: 'male-half-sleeves-t-shirt',
            clothingColor: 'white', // Will be updated by useEffect
            style: 'modern',
            printLocation: 'front',
            includeLogo: false,
        },
    });

    const selectedClothing = form.watch('clothingType');
    const selectedCategory = form.watch('category');
    const selectedColor = form.watch('clothingColor');

    // Get available colors for the selected clothing type
    const availableColors = getColorsForClothingType(selectedClothing);

    // Reset clothing type when category changes
    React.useEffect(() => {
        const currentClothingType = form.getValues('clothingType');
        const availableClothingTypes = clothingTypes.filter(type => 
            type.category === selectedCategory || type.category === 'unisex'
        );
        const isCurrentTypeAvailable = availableClothingTypes.some(type => type.id === currentClothingType);
        
        if (!isCurrentTypeAvailable && availableClothingTypes.length > 0) {
            form.setValue('clothingType', availableClothingTypes[0].id);
        }
    }, [selectedCategory, form]);

    // Reset color when clothing type changes
    React.useEffect(() => {
        const currentColor = form.getValues('clothingColor');
        const isCurrentColorAvailable = availableColors.some(color => color.id === currentColor);
        
        if (!isCurrentColorAvailable && availableColors.length > 0) {
            form.setValue('clothingColor', availableColors[0].id);
        }
    }, [selectedClothing, availableColors, form]);

    // Set initial color when component mounts
    React.useEffect(() => {
        if (availableColors.length > 0) {
            const currentColor = form.getValues('clothingColor');
            if (!availableColors.some(color => color.id === currentColor)) {
                form.setValue('clothingColor', availableColors[0].id);
            }
        }
    }, [availableColors, form]);

    async function onSubmit(data: DesignFormValues) {
        setIsLoading(true);
        setDesignIdeas([]);
        setGeneratedImageUrl(null);
        setVirtualTryOnImages(null);
        try {
            // Extract base clothing type for design generation (remove category prefix)
            const baseClothingType = data.clothingType.replace(/^(male|female)-/, '');
            const designData = { 
                prompt: data.prompt,
                category: data.category,
                clothingType: baseClothingType,
                sleeveLength: 'half', // Default value for compatibility
                clothingColor: data.clothingColor,
                printStyle: 'centered', // Default value for compatibility
                style: data.style,
                printLocation: data.printLocation,
                includeLogo: data.includeLogo
            };
            
            const [ideasResult, imageResult] = await Promise.all([
                AIService.generateDesignIdeas({ prompt: data.prompt }),
                AIService.generateDesignImage(designData)
            ]);

            if (ideasResult.designIdeas && ideasResult.designIdeas.length > 0) {
                setDesignIdeas(ideasResult.designIdeas);
            }
            if (imageResult.imageUrl) {
                setGeneratedImageUrl(imageResult.imageUrl);
            }

            if ((ideasResult.designIdeas && ideasResult.designIdeas.length > 0) || imageResult.imageUrl) {
                 toast({
                    title: "Designs Generated!",
                    description: "Your new design and ideas are ready.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Couldn't generate designs. Please try again.",
                });
            }
        } catch (error) {
            console.error("Failed to generate designs:", error);
            
            // Fallback: Generate basic design ideas and use a fallback image
            const fallbackIdeas = [
                `${data.prompt} with modern minimalist style`,
                `${data.prompt} with vintage retro vibes`,
                `${data.prompt} with abstract artistic elements`
            ];
            setDesignIdeas(fallbackIdeas);
            
            // Use a fallback image URL
            const fallbackImageUrl = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
            setGeneratedImageUrl(fallbackImageUrl);
            
            toast({
                title: "Design Generated (Fallback Mode)",
                description: "Using fallback design generation. Check console for details.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    async function handleUseIdea(idea: string) {
        setUpdatingIdea(idea);
        setVirtualTryOnImages(null);
        try {
            const values = form.getValues();
            // Extract base clothing type for design generation (remove category prefix)
            const baseClothingType = values.clothingType.replace(/^(male|female)-/, '');
            const designData = { 
                prompt: idea,
                category: values.category,
                clothingType: baseClothingType,
                sleeveLength: 'half', // Default value for compatibility
                clothingColor: values.clothingColor,
                printStyle: 'centered', // Default value for compatibility
                style: values.style,
                printLocation: values.printLocation,
                includeLogo: values.includeLogo
            };
            const imageResult = await AIService.generateDesignImage(designData);

            if (imageResult.imageUrl) {
                setGeneratedImageUrl(imageResult.imageUrl);
                toast({
                    title: "Design Updated!",
                    description: "Your new design is ready in the preview.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Couldn't update design. Please try again.",
                });
            }
        } catch (error) {
            console.error("Failed to generate design from idea:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        } finally {
            setUpdatingIdea(null);
        }
    }

    const handleUserPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setUserPhoto(e.target?.result as string);
            setVirtualTryOnImages(null);
          };
          reader.readAsDataURL(file);
        }
    };

    async function handleVirtualTryOn() {
        if (!userPhoto || !generatedImageUrl) {
            toast({
                variant: "destructive",
                title: "Missing Images",
                description: "Please upload a photo and generate a design first.",
            });
            return;
        }
        setIsGeneratingAvatar(true);
        setVirtualTryOnImages(null);
        try {
            const clothingType = form.getValues('clothingType');
            // Extract base clothing type for avatar generation (remove category prefix)
            const baseClothingType = clothingType.replace(/^(male|female)-/, '');
            const result = await AIService.generateAvatarViews({
                userPhoto,
                designImage: generatedImageUrl,
                clothingType: baseClothingType,
            });
    
            if (result.avatarViews && result.avatarViews.length >= 3) {
                setVirtualTryOnImages({
                    front: result.avatarViews[0],
                    side: result.avatarViews[1],
                    back: result.avatarViews[2],
                });
                toast({
                    title: "Avatar Ready!",
                    description: "Your virtual try-on is complete.",
                });
            } else {
                 throw new Error("Generated images were not found in the result.");
            }
    
        } catch (error) {
            console.error("Failed to generate avatar views:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not generate the virtual try-on.",
            });
        } finally {
            setIsGeneratingAvatar(false);
        }
    }
    
    function handleAddToCart() {
        if (!generatedImageUrl) {
            toast({
                variant: 'destructive',
                title: 'No Design Generated',
                description: 'Please generate a design before adding to cart.',
            });
            return;
        }

        const values = form.getValues();
        const clothingTypeLabel = clothingTypes.find(c => c.id === values.clothingType)?.label || values.clothingType;
        
        // Get print location description
        let printLocationText = '';
        switch (values.printLocation) {
            case 'front':
                printLocationText = ', Print Location: Front (Chest area)';
                break;
            case 'back':
                printLocationText = ', Print Location: Back (Upper back)';
                break;
            case 'full-coverage':
                printLocationText = ', Print Location: Full Coverage (Entire garment)';
                break;
            case 'custom':
                printLocationText = customPrintLocation ? `, Print Location: Custom (${customPrintLocation})` : ', Print Location: Custom area';
                break;
        }

        // Add logo information if included
        const logoText = values.includeLogo ? ', DAPI Logo: Included' : '';

        // Extract base clothing type for pricing (remove category prefix)
        const baseClothingType = values.clothingType.replace(/^(male|female)-/, '');

        // Calculate price using the new pricing system (using 'centered' as default print style)
        const itemPrice = calculateItemPrice(
            baseClothingType,
            values.clothingColor,
            'centered', // Default print style since it was removed
            selectedSize
        );

        const cartItem = {
            id: `${generatedImageUrl}-${selectedSize}-${values.printLocation}`, 
            name: `Custom ${clothingTypeLabel}`,
            description: `Color: ${values.clothingColor}, Style: ${values.style}${printLocationText}${logoText}`,
            price: itemPrice,
            imageUrl: generatedImageUrl,
            size: selectedSize,
            printLocation: values.printLocation,
            customPrintLocation: values.printLocation === 'custom' ? customPrintLocation : undefined,
            includeLogo: values.includeLogo,
            // Add pricing details for transparency
            clothingType: values.clothingType,
            clothingColor: values.clothingColor,
            printStyle: 'centered', // Default since field was removed
        };

        addToCart(cartItem);

        toast({
            title: 'Added to Cart!',
            description: `Your custom design has been added to the cart for ${getPriceDisplay(values.clothingType.replace(/^(male|female)-/, ''), values.clothingColor, 'centered', selectedSize)}`,
        });
    }

    async function handleDownloadImage() {
        if (!generatedImageUrl) {
            toast({
                variant: 'destructive',
                title: 'No Image to Download',
                description: 'Please generate a design first.',
            });
            return;
        }

        try {
            // Fetch the image
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            
            // Create a temporary URL
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary anchor element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `custom-design-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Download Started',
                description: 'Your design is being downloaded.',
            });
        } catch (error) {
            console.error('Failed to download image:', error);
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'Could not download the image. Please try again.',
            });
        }
    }

    return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Design Studio</CardTitle>
              <CardDescription>Fill out the details to create your design.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                   <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe your design or inspiration</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., a synthwave sunset with a chrome tiger" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="male" className="sr-only" />
                                </FormControl>
                                <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer text-center h-full', {'border-primary': field.value === 'male'})}>
                                    <TshirtIcon className="mb-3 h-6 w-6" />
                                    <span className="text-xs">Male</span>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="female" className="sr-only" />
                                </FormControl>
                                <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer text-center h-full', {'border-primary': field.value === 'female'})}>
                                    <TshirtIcon className="mb-3 h-6 w-6" />
                                    <span className="text-xs">Female</span>
                                </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clothingType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Clothing Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-4"
                          >
                            {clothingTypes.filter(type => 
                                type.category === selectedCategory || type.category === 'unisex'
                            ).map((type) => (
                                <FormItem key={type.id}>
                                    <FormControl>
                                        <RadioGroupItem value={type.id} className="sr-only" />
                                    </FormControl>
                                    <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer text-center h-full', {'border-primary': field.value === type.id})}>
                                        <type.icon className="mb-3 h-6 w-6" />
                                        <span className="text-xs">{type.label}</span>
                                    </FormLabel>
                                </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  
                  

                  <FormField
                    control={form.control}
                    name="clothingColor"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-4 gap-4"
                          >
                            {availableColors.map((color) => (
                                <FormItem key={color.id}>
                                    <FormControl>
                                        <RadioGroupItem value={color.id} className="sr-only" />
                                    </FormControl>
                                    <FormLabel className={cn('h-10 w-10 rounded-full border-2 flex items-center justify-center cursor-pointer', {'border-primary': field.value === color.id})}>
                                       <div className="h-8 w-8 rounded-full" style={{backgroundColor: color.hex}}/>
                                    </FormLabel>
                                </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Style</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="modern" /></FormControl>
                                <FormLabel className="font-normal">Modern</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="vintage" /></FormControl>
                                <FormLabel className="font-normal">Vintage</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="abstract" /></FormControl>
                                <FormLabel className="font-normal">Abstract</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="printLocation"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Print Location</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="front" className="sr-only" />
                                </FormControl>
                                <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer', {'border-primary': field.value === 'front'})}>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold mb-1">Front</div>
                                        <div className="text-xs text-muted-foreground">Chest area</div>
                                    </div>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="back" className="sr-only" />
                                </FormControl>
                                <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer', {'border-primary': field.value === 'back'})}>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold mb-1">Back</div>
                                        <div className="text-xs text-muted-foreground">Upper back</div>
                                    </div>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="full-coverage" className="sr-only" />
                                </FormControl>
                                <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer', {'border-primary': field.value === 'full-coverage'})}>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold mb-1">Full Coverage</div>
                                        <div className="text-xs text-muted-foreground">Entire garment</div>
                                    </div>
                                </FormLabel>
                            </FormItem>
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="custom" className="sr-only" />
                                </FormControl>
                                <FormLabel className={cn('flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer', {'border-primary': field.value === 'custom'})}>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold mb-1">Custom Area</div>
                                        <div className="text-xs text-muted-foreground">Specific region</div>
                                    </div>
                                </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        {field.value === 'custom' && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-location">Describe the specific area</Label>
                            <Input
                              id="custom-location"
                              placeholder="e.g., left sleeve, right pocket, shoulder area"
                              value={customPrintLocation}
                              onChange={(e) => setCustomPrintLocation(e.target.value)}
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeLogo"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Add DAPI Logo</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="include-logo"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <Label htmlFor="include-logo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Include DAPI logo on the design
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading || isUpdatingImage}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Design
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {/* Logo Toggle and Download Button */}
                    {generatedImageUrl && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Switch 
                                    id="logo-toggle" 
                                    checked={showLogoOnPreview}
                                    onCheckedChange={setShowLogoOnPreview}
                                />
                                <Label htmlFor="logo-toggle" className="text-sm font-medium cursor-pointer">
                                    Show DAPI Logo
                                </Label>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleDownloadImage}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    )}
                    
                    <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center relative">
                        {(isLoading || isUpdatingImage) && <Loader2 className="absolute h-12 w-12 animate-spin text-primary z-10" />}
                        <Image
                            src={generatedImageUrl || "https://picsum.photos/600/600?random=1"}
                            alt={generatedImageUrl ? "Generated design" : "T-shirt mockup"}
                            width={600}
                            height={600}
                            className={`rounded-lg object-cover transition-opacity duration-300 ${(isLoading || isUpdatingImage) ? 'opacity-30' : 'opacity-100'}`}
                            data-ai-hint="apparel design"
                            key={generatedImageUrl}
                        />
                        
                        {/* Logo Overlay */}
                        {generatedImageUrl && showLogoOnPreview && (
                            <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg">
                                <Image
                                    src="/assets/brand_logo.jpg"
                                    alt="DAPI Logo"
                                    width={60}
                                    height={60}
                                    className="object-contain"
                                />
                            </div>
                        )}
                        
                        {!generatedImageUrl && !(isLoading || isUpdatingImage) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-slate-500 text-3xl font-bold select-none capitalize">{selectedClothing.replace('-', ' ')}</p>
                                    <p className="text-slate-400 text-lg font-medium select-none mt-2">Your design here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="font-headline text-lg mb-4">AI-Generated Ideas</h3>
                        {isLoading && !isUpdatingImage && (
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                            </div>
                        )}
                        <div className="space-y-4">
                            {designIdeas.length > 0 && (
                                designIdeas.slice(0, 3).map((idea, index) => (
                                <Card key={index} className="bg-muted/50">
                                    <CardContent className="p-4">
                                        <p>{idea}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => handleUseIdea(idea)}
                                            disabled={isLoading || isUpdatingImage}
                                        >
                                            {updatingIdea === idea && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Use this idea
                                        </Button>
                                    </CardContent>
                                </Card>
                                ))
                            )}
                            
                            {!isLoading && designIdeas.length === 0 && (
                                <p className="text-muted-foreground">Your generated design ideas will appear here.</p>
                            )}
                        </div>
                    </div>
                    
                    {generatedImageUrl && !isLoading && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="size-select" className="text-sm">Size</Label>
                                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                                        <SelectTrigger id="size-select" className="w-full">
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="S">S</SelectItem>
                                            <SelectItem value="M">M</SelectItem>
                                            <SelectItem value="L">L</SelectItem>
                                            <SelectItem value="XL">XL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-sm">Print Location</Label>
                                    <div className="text-sm font-medium p-2 bg-muted rounded-md">
                                        {(() => {
                                            const printLocation = form.watch('printLocation');
                                            switch (printLocation) {
                                                case 'front':
                                                    return 'Front (Chest area)';
                                                case 'back':
                                                    return 'Back (Upper back)';
                                                case 'full-coverage':
                                                    return 'Full Coverage';
                                                case 'custom':
                                                    return customPrintLocation ? `Custom: ${customPrintLocation}` : 'Custom area';
                                                default:
                                                    return 'Not selected';
                                            }
                                        })()}
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-sm">DAPI Logo</Label>
                                    <div className="text-sm font-medium p-2 bg-muted rounded-md">
                                        {form.watch('includeLogo') ? 'Included' : 'Not included'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Price Display */}
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">Price:</span>
                                    <span className="text-lg font-bold text-primary">
                                        {getPriceDisplay(
                                            form.getValues('clothingType').replace(/^(male|female)-/, ''),
                                            form.getValues('clothingColor'),
                                            'centered', // Default print style
                                            selectedSize
                                        )}
                                    </span>
                                </div>
                                <PriceBreakdown 
                                    clothingType={form.getValues('clothingType').replace(/^(male|female)-/, '')}
                                    color={form.getValues('clothingColor')}
                                    printStyle={'centered'} // Default print style
                                    size={selectedSize}
                                />
                            </div>
                            
                            <Button 
                              variant="default" 
                              className="w-full" 
                              onClick={handleAddToCart} 
                              disabled={isUpdatingImage}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4"/>
                                Add to Cart
                            </Button>
                        </div>
                      )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Virtual Try-On</CardTitle>
                    <CardDescription>Upload your photo to see how the design looks on an AI-generated avatar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="user-photo">Upload Your Photo</Label>
                        <Input id="user-photo" type="file" accept="image/*" onChange={handleUserPhotoChange} disabled={isGeneratingAvatar || !generatedImageUrl} />
                        {!generatedImageUrl && <p className="text-sm text-muted-foreground">Please generate a design first.</p>}
                    </div>
                    <Button onClick={handleVirtualTryOn} className="w-full" disabled={!userPhoto || !generatedImageUrl || isGeneratingAvatar}>
                        {isGeneratingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                        Try It On
                    </Button>

                    {isGeneratingAvatar && (
                        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}

                    {virtualTryOnImages && (
                        <Tabs defaultValue="front" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="front">Front</TabsTrigger>
                                <TabsTrigger value="side">Side</TabsTrigger>
                                <TabsTrigger value="back">Back</TabsTrigger>
                            </TabsList>
                            <TabsContent value="front">
                                <div className="w-full aspect-square bg-muted rounded-lg relative mt-2">
                                    <Image src={virtualTryOnImages.front} alt="Avatar front view" layout="fill" objectFit="cover" className="rounded-lg" />
                                </div>
                            </TabsContent>
                            <TabsContent value="side">
                                <div className="w-full aspect-square bg-muted rounded-lg relative mt-2">
                                    <Image src={virtualTryOnImages.side} alt="Avatar side view" layout="fill" objectFit="cover" className="rounded-lg" />
                                </div>
                            </TabsContent>
                            <TabsContent value="back">
                                <div className="w-full aspect-square bg-muted rounded-lg relative mt-2">
                                    <Image src={virtualTryOnImages.back} alt="Avatar back view" layout="fill" objectFit="cover" className="rounded-lg" />
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Price Breakdown Component
function PriceBreakdown({ 
  clothingType, 
  color, 
  printStyle, 
  size 
}: { 
  clothingType: string; 
  color: string; 
  printStyle: string; 
  size: string; 
}) {
  const breakdown = getPriceBreakdown(clothingType, color, printStyle, size);
  
  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Base Price:</span>
        <span>₹{breakdown.basePrice.toFixed(0)}</span>
      </div>
      {breakdown.sizeSurcharge !== 0 && (
        <div className="flex justify-between text-green-600">
          <span>Size Adjustment:</span>
          <span>{breakdown.sizeSurcharge > 0 ? '+' : ''}₹{breakdown.sizeSurcharge.toFixed(0)}</span>
        </div>
      )}
      <div className="border-t pt-1 flex justify-between font-semibold">
        <span>Total:</span>
        <span>₹{breakdown.total.toFixed(0)}</span>
      </div>
    </div>
  );
}
