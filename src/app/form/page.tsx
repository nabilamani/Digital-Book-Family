import { MultiStepForm } from "@/components/forms/MultiStepForm";

export default function FormPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-184px)] flex flex-col items-center justify-center px-4 py-6 md:px-6 md:py-12">
      <div className="w-full max-w-3xl mb-4 md:mb-8 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">Pengumpulan Data Keluarga</h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          Lengkapi data diri Anda dan relasi keluarga terdekat. Data ini akan disimpan dengan aman.
        </p>
      </div>
      
      <MultiStepForm />
    </div>
  );
}
