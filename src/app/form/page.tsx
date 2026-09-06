import { MultiStepForm } from "@/components/forms/MultiStepForm";

export default function FormPage() {
  return (
    <div className="w-full min-h-[calc(100vh-184px)] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Pengumpulan Data Keluarga</h1>
        <p className="text-muted-foreground text-lg">
          Lengkapi data diri Anda dan relasi keluarga terdekat. Data ini akan disimpan dengan aman.
        </p>
      </div>
      
      <MultiStepForm />
    </div>
  );
}
