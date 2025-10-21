<template>
    <v-card>
        <v-card-text>
            <v-autocomplete v-model="typeAffaireChoisi" label="choix d'un type d'affaire" :items="typesAffaireListe"
                :custom-filter="customFilter" item-title="typeaffaire" item-value="idtypeaffaire" return-object class="flex-0-0"
                style="width: 600px; min-width: 400px;" no-virtual clearable></v-autocomplete>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type { FilterFunction } from 'vuetify'
import type { TypeAffaire, ApiResponseTAL } from '@/axioscalls.js'

import { ref, watch } from 'vue'
import { getTypesAffaireListe } from '@/axioscalls.js'

const messageErreur = ref<string | undefined>('')
const ssServer = ref<string>('')
if (import.meta.env.DEV) {
    ssServer.value = 'https://mygolux.lausanne.ch'
}
const ssPage = ref<string>('/goeland/gestion_spec/affaire_datainitgestion/axios/typesaffaire_liste.php')

const typeAffaireChoisi = ref<TypeAffaire | null>(null)
const typesAffaireListe = ref<TypeAffaire[]>([])
const response: ApiResponseTAL = await getTypesAffaireListe(ssServer.value, ssPage.value)
if (response.success === false) {
    messageErreur.value = response.message
} else {
    messageErreur.value = ''
}
typesAffaireListe.value = response.success && response.data ? response.data : []

watch(() => typeAffaireChoisi.value, (): void => {
  if (typeAffaireChoisi.value !== null) {
    choixTypeAffaire(typeAffaireChoisi.value)
  }
})

const emit = defineEmits<{
  (e: 'choixTypeAffaire', id: number, choix: string): void
}>()

const choixTypeAffaire = (typeAffaire: TypeAffaire): void => {
  emit('choixTypeAffaire', typeAffaire.idtypeaffaire, JSON.stringify(typeAffaire))
}

const customFilter: FilterFunction = (
    itemTitle: string,
    queryText: string,
    item?: any
): boolean => {
    if (!queryText || !item) return true

    const removeAccents = (str: string): string =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const textLowerCase = itemTitle.toLowerCase()
    const searchTextLowerCase = queryText.toLowerCase()
    const textUnAccent = removeAccents(itemTitle)
    const searchTextUnAccent = removeAccents(queryText.toLowerCase())

    return textLowerCase.includes(searchTextLowerCase) ||
        textUnAccent.includes(searchTextUnAccent)
}
</script>