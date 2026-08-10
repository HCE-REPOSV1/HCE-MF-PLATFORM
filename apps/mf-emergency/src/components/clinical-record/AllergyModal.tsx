
import type { GenericTableColumn } from "@hce/design-system";
import {
  HceFormModal,
  hceColors, hceTypography,
  GenericTable,
  Box,
  RadioGroup,
  UiEditingIcon,
  hceTransition,
  HceModal,
  UiWarningIcon,
  MultiSelect,
  TextareaField,
} from "@hce/design-system"
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiButton          from "@mui/material/Button"

import { Grid } from "@mui/material";
import { useCatalog } from "../../hooks/useCatalog";
import { usePermiso } from "../../hooks/usePermiso";
import { PERMISOS_EMERGENCY } from "../../config/permisos";
import { mapAllergyApiItemToAvailabilityItem, type AllergyForm } from "../../mapper/allergy.mapper";



export interface AllergyModalProps {
  open:       boolean
  onClose:    () => void
  /** id para identificar la alergia) */
  encounterId?:  string

  mode?: "read" | "write";
  onSaveChanges?: () => void | Promise<void>
 
}

const EMPTY_FORM: AllergyForm = {
  allergy_id: "1",
  encounter_id: "1",
  has_allergy: false,
  api: [],
  food: "",
  other: "",

};




 const createInfoColumns = ({  canEdit,onEdit }: {
    canEdit: boolean
  onEdit: (row: AllergyForm) => void
}): GenericTableColumn<AllergyForm>[] => [
   
  {
    key: "API",
    header: "Principio activo",
    type: "list",
    field: "api",
    width: 100,
    align: "left",
  },
  {
    key: "food",
    header: "Alimentos",
    type: "text",
    field: "food",
    width: 100,
    align: "center",
  },
  {
    key: "other",
    header: "Otros",
    type: "text",
    field: "other",
    width: 100,
    align: "center",
  },
  
  
   {
    key: "on_edit",
    header: "Editar",
    type: "icon",
    field: "edit",
    icon: UiEditingIcon,
    iconSize: 10,
    width: 20,
    align: "center",
    clickable: true,
    disabledGetter: () => !canEdit,
    colorGetter: () => (canEdit ? hceColors.primary.green[600] : "#A0A0A0"),
    onClick: (row) => {
        onEdit(row)
    },
}

]


const allergyExample: AllergyForm[] =[ {
  allergy_id: "1",
  encounter_id: "1",
  has_allergy: false,
  api: [
    
  ],
  food: null,
  other: null,

}

]







export function AllergyModal({ open, onClose,onSaveChanges, mode = "write",encounterId }: AllergyModalProps) { 
  const readOnly = mode === "read";
  const canEdit= usePermiso(
    PERMISOS_EMERGENCY.allergy.write,
  );

  const [form, setForm] = useState<AllergyForm>(EMPTY_FORM);

  const [allergyEditionOpen, setallergyEditionOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optionsActivePrinciples, setOptionsActivePrinciples] = useState<
    { value: string; label: string }[]
  >([]);
   const canAlergiasTriage = usePermiso(
    PERMISOS_EMERGENCY.allergy.base,
  );

  const [allergySelected, setAllergySelected] = useState<AllergyForm>();

  const [enabledAlergiasTriage, setEnabledAlergiasTriage] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

   const [valuePrincipioActivo, setValuePrincipioActivo] = useState<string[]>(
    [],
  );

  //const { fetchAllergyFull, loading: loadingAllergyFull } = useAllergyFull();

   const allergyBoard = useMemo(() => allergyExample.map(mapAllergyApiItemToAvailabilityItem), [allergyExample])
  
    
  const opcionesRadioAlergia = [
    { value: true, label: "Si" },
    { value: false, label: "Niega alergias" },
  ];

  const {
    
    fetchCatalogActivePrinciples,
    
  } = useCatalog();

 

  

  const handleSave = useCallback(async () => {
    
     if (readOnly) return;
    try {
      setSaving(true)
      setError(null)
  
     await onSaveChanges?.()
      
  
     
    } catch (err) {
      setSaving(false)
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo editar la alergia",
      )
    }
    finally {
       setallergyEditionOpen(false)
       setSaving(false)
   
  }
  }, [onSaveChanges, readOnly])

  //const [hasChanges, setHasChanges] = useState(false)

  const handleConfirm = useCallback(async () => {
  try {
    setConfirm(false)
    if (allergySelected) {
      setForm({ ...allergySelected })
      setValuePrincipioActivo([...allergySelected.api])
    }
    setallergyEditionOpen(true)
    
    
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No se pudo refrescar la información",
    )
  } finally {
    setConfirm(false)
   
  }
}, [allergySelected])

 const handleCancel = useCallback(() => {
      setAllergySelected(undefined)
      setConfirm(false)
    }, [])
  
  const handleEdit = useCallback(async (row: AllergyForm) => {
    setConfirm(true)
    setAllergySelected(row)

    }, [])


  const handleClose = useCallback(async () => {
      setForm(EMPTY_FORM)
      setValuePrincipioActivo([])
      setAllergySelected(undefined)
      setallergyEditionOpen(false)
      setConfirm(false)
      onClose()
    }, [ onClose])

    const columns = useMemo(
      () =>
        createInfoColumns({
          canEdit,
          onEdit:handleEdit
        }),
      [canEdit,handleEdit],
    )

    const activePrincipleOptions = useMemo(() => {
      const catalogValues = new Set(optionsActivePrinciples.map(({ value }) => value))
      const rawOptions = valuePrincipioActivo
        .filter((value) => !catalogValues.has(value))
        .map((value) => ({ value, label: value }))

      return [...optionsActivePrinciples, ...rawOptions]
    }, [optionsActivePrinciples, valuePrincipioActivo])

    const isSaveDisabled =
   
    saving ||
    Boolean(error) 
    //||
   // (!form.tieneAlergia?  ),

    const set = useCallback(
    <K extends keyof AllergyForm>(key: K, val: AllergyForm[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
    },
    [],
  );


    useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([
          fetchCatalogActivePrinciples(),
         
        ]);
        const [
          activePrinciples,
         
        ] = results;

      

        if (activePrinciples && Array.isArray(activePrinciples)) {
          const transformerOptions = activePrinciples
            .filter((p) => p.is_active)
            .map(({ active_principle_id, substance_name }) => ({
              value: String(active_principle_id),
              label: substance_name,
            }));
          setOptionsActivePrinciples(transformerOptions);
        }

        

       
      } catch (err) {
        console.error("Error al cargar información", err);
        setLoadError(
          "No se pudo cargar la información de catálogos. Recargue el formulario.",
        );
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setEnabledAlergiasTriage(!(readOnly || encounterId === "read"))
  }, [readOnly, encounterId])
   
  

 

    return(

<>

<HceModal
      maxWidth={400}
      open={confirm}
      title="¿Desea continuar con la edición de las alergias declaradas?"
      icon={<UiWarningIcon />}
      confirmButton={{
        label: "Aceptar",
        onClick: handleConfirm,
      }}
      cancelButton={{

        label: "Cancelar",
        onClick: handleCancel,
      }}
    />
    
  {!confirm && ( 

    <HceFormModal
        open={open && !loadError}
        onClose={handleClose}
        title="Declaratoria de alergias "
        maxWidth={allergyEditionOpen? 'md':1200}
        buttonAlign="right"
       
        >
        {/* El HceModal acepta children opcionales — aquí metemos el select */}
       <Box sx={{ textAlign: "center", mt: 1 }}>
          {!allergyBoard ?  (
            <Box
              sx={{
                py: 1.5,
                textAlign: "center",
                fontFamily: hceTypography.fontFamily,
                fontSize: "0.875rem",
                color: hceColors.neutro.black[300],
              }}
            >
              Cargando informacion del paciente
            </Box>
          ) : !allergyEditionOpen? (
             
                <GenericTable
                  rows={allergyBoard}
                  columns={columns}
                  getRowId={(row) => row.allergy_id}
                  maxHeight="100%"
                /> 
               
              ):(

              <Box>

              <Box  sx={{ display: "flex", flexDirection: "column", gap: 2, textAlign:'start' }}>
               
                
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2, textAlign:'start' }}
                  >
                    <Grid
                      container
                      columns={5}
                      spacing={2}
                      sx={{
                        width:"100%",
                        alignItems: "flex-end",
                       
                      }}
                    >
                      <Grid size={{ xs: 5, sm: 2, md: 2 }}>
                        <RadioGroup
                          disabled={!canAlergiasTriage || !enabledAlergiasTriage}
                          value={form.has_allergy}
                          options={opcionesRadioAlergia}
                          onChange={(v) => {
                            set("has_allergy", v);
                            if(v==false){
                              setValuePrincipioActivo([])
                              set("food", "")
                              set("other", "")
                            }
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 5, sm: 3, md: 3 }}>
                        <MultiSelect
                          disabled={!canAlergiasTriage || !enabledAlergiasTriage || !form.has_allergy}
                          options={activePrincipleOptions}
                          label="Principio activo"
                          value={valuePrincipioActivo}
                          onChange={(values) => {
                            setValuePrincipioActivo(values)
                            set("api", values)
                          }}
                        />
                      </Grid>
                    </Grid>
                    <TextareaField
                      label="Alimentos"
                      value={form.food?? ''}
                      onChange={(v) => set("food", v)}
                      maxLength={100}
                      placeholder="Describa alergias alimentarias"
                      disabled={!canAlergiasTriage || !enabledAlergiasTriage || form.has_allergy == false}
                    />
                    <TextareaField
                      label="Otros"
                      value={form.other?? ''}
                      onChange={(v) => set("other", v)}
                      maxLength={100}
                      placeholder="Otros tipos de alergia"
                      disabled={!canAlergiasTriage || !enabledAlergiasTriage || form.has_allergy == false}
                    />
                  </Box>

                  <Box  sx={{ display: "flex", justifyContent:'end' }}>

                      <MuiButton
                          variant="contained"
                  
                          onClick= {handleSave}
                          disabled={isSaveDisabled}
                          aria-label='Aceptar'
                          sx={{
                            fontFamily:      hceTypography.fontFamily,
                            fontWeight:      600,
                            fontSize:        "0.875rem",
                            textTransform:   "none",
                            borderRadius:    "6px",
                            backgroundColor: hceColors.primary.green[600],
                            color:           "#ffffff",
                            minWidth:        "100px",
                            height:          "36px",
                            boxShadow:       "none",
                            transition:      `background-color ${hceTransition.fast}`,
                            "&:hover:not(:disabled)": {
                              backgroundColor: ` ${hceColors.primary.green[600]}`,
                              boxShadow:       "none",
                            },
                            "&:focus-visible": {
                              outline:       `2px solid ${ hceColors.primary.blue[600]}`,
                              outlineOffset: "2px",
                            },
                            "&:disabled": {
                              backgroundColor: hceColors.neutro.black[50],
                              color:           hceColors.neutro.black[200],
                            },
                            "& .MuiButton-startIcon": { margin: 0 },
                          }}
                        >
                          
                        Aceptar
                    </MuiButton>

                  </Box>


                
              </Box>


          
        </Box>
          )}
        </Box>
      </HceFormModal>
    )}
  </>
)};
