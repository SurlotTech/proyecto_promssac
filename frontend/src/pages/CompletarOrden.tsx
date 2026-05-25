import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import StepContacto from "@/components/completarOrden/steps/StepContacto";
import StepDatosOrden from "@/components/completarOrden/steps/StepDatosOrden";
import StepDireccion from "@/components/completarOrden/steps/StepDireccion";
import StepPersonalizados from "@/components/completarOrden/steps/StepPersonalizados";
import type { CustomFieldKey } from "@/lib/completarOrden/constants";
import { useCompletarOrdenForm } from "@/hooks/useCompletarOrdenForm";

const CompletarOrden = () => {
  const f = useCompletarOrdenForm();

  if (!f.draft || f.hydratingOrder) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">
          {!f.draft ? "Cargando…" : "Cargando datos de la orden…"}
        </p>
      </div>
    );
  }

  const renderStep = () => {
    switch (f.currentStep) {
      case 0:
        return (
          <StepDatosOrden
            draft={f.draft}
            deliveryFrom={f.deliveryFrom}
            deliveryTo={f.deliveryTo}
            onDeliveryRangeChange={f.onDeliveryRangeChange}
            mode={f.mode}
            onModeChange={f.setMode}
            priority={f.priority}
            onPriorityChange={f.setPriority}
            cod={f.cod}
            onCodChange={f.setCod}
            minDate={f.routeFechaInicio}
            maxDate={f.routeFechaFin || f.routeFechaInicio}
          />
        );
      case 1:
        return (
          <StepContacto
            idType={f.idType}
            onIdTypeChange={f.setIdType}
            contactIdentifier={f.contactIdentifier}
            onContactIdentifierChange={f.setContactIdentifier}
            consultandoDocumento={f.consultandoDocumento}
            contactName={f.contactName}
            onContactNameChange={f.setContactName}
            contactPhone={f.contactPhone}
            onContactPhoneChange={f.setContactPhone}
            contactEmail={f.contactEmail}
            onContactEmailChange={f.setContactEmail}
          />
        );
      case 2:
        return (
          <StepDireccion
            contactName={f.contactName}
            onContactNameChange={f.setContactName}
            clientSearchQuery={f.clientSearchQuery}
            onClientSearchQueryChange={f.setClientSearchQuery}
            addressLine={f.addressLine}
            onAddressLineChange={f.setAddressLine}
            normalizedAddress={f.normalizedAddress}
            serviceMinutes={f.serviceMinutes}
            onServiceMinutesChange={f.setServiceMinutes}
            addressReference={f.addressReference}
            onAddressReferenceChange={f.setAddressReference}
            lat={f.lat}
            lng={f.lng}
            geocodificando={f.geocodificandoMapa}
            lowAddressConfidence={f.lowAddressConfidence}
            onBuscarPorTexto={f.buscarDireccionPorTexto}
            onMapLocationCommit={f.aplicarUbicacionEnMapa}
            clientSearchOpen={f.clientSearchOpen}
            onClientSearchOpenChange={f.setClientSearchOpen}
            clientSearchResults={f.clientSearchResults}
            clientSearching={f.clientSearching}
            onClientSearch={f.handleClientSearch}
            onClientSelect={f.handleClientSelect}
          />
        );
      case 3:
        return (
          <StepPersonalizados
            customFields={f.customFields}
            onCustomFieldChange={(key: CustomFieldKey, value: string) =>
              f.setCustomFields((prev) => ({ ...prev, [key]: value }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent">
      <header className="sticky top-0 z-10 bg-transparent px-4 py-3 sm:px-6">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-foreground hover:bg-muted"
              onClick={f.handleBackToList}
              aria-label="Volver a órdenes"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Completar datos de la orden
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {f.draft.routeLabel ? (
                  <span className="mr-2 font-medium text-foreground">Ruta: {f.draft.routeLabel}</span>
                ) : null}
                <span className="whitespace-nowrap">
                  <span className="font-semibold text-primary">*</span> Obligatorio
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
          <div className="rounded-[2.5rem] border border-white/20 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-2xl p-4">
            <div className="flex items-center justify-center">
              <Stepper
                steps={f.steps}
                currentStep={f.currentStep}
                onStepChange={f.setCurrentStep}
                completedSteps={f.completedSteps}
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full">
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                {renderStep()}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 w-full sm:w-auto"
              onClick={f.currentStep === 0 ? f.handleBackToList : f.handlePrevious}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {f.currentStep === 0 ? "Cancelar" : "Anterior"}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              {f.currentStep === f.steps.length - 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-full gap-2 border-primary/40 text-primary hover:bg-primary-soft sm:w-auto"
                    onClick={f.goToProductos}
                  >
                    <Plus className="size-4 shrink-0" />
                    Agregar productos
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                    onClick={() => void f.handleSave()}
                    disabled={!f.canSave || f.guardandoOrden}
                  >
                    {f.guardandoOrden ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </Button>
                </>
              ) : null}
              {f.currentStep < f.steps.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  className="h-10 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                  onClick={f.handleNext}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletarOrden;
