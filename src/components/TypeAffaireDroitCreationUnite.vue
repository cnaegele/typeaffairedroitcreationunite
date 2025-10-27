<template>
  <CallerInfo :ssServer="ssServer" @callerinfo="receptionCallerInfo"></CallerInfo>
  <CallerIsInGroup :ssServer="ssServer" nomgroupe="GoelandManager"
    @calleringroup="receptionCallerInGroupGoelandManager"></CallerIsInGroup>

  <v-app>
    <v-main>
      <v-app-bar color="primary" prominent density="compact" app>
        <v-toolbar-title>Types d'affaire, droits de création par unité</v-toolbar-title>

        <v-spacer></v-spacer>
        <div style="position: absolute; right: 16px;">
          Utilisateur: {{ callerInformation?.prenom }} {{ callerInformation?.nom }} ({{
            callerInformation?.login }}) - {{ callerInformation?.unite }}
        </div>
      </v-app-bar>
      <div v-if="messageErreur != ''" id="divErreur">{{ messageErreur }}</div>
      <div v-if="message != ''" id="divMessage">{{ message }}</div>
      <div v-if="bGoelandManager">
        <suspense>
          <TypesAffaireListeChoix @choixTypeAffaire="receptionTypeAffaire"></TypesAffaireListeChoix>
        </suspense>
        <div v-if="idTypeAffaireChoisi !== null">
          <v-list max-height="400">
            <v-list-subheader class="d-flex justify-space-between align-center">
              <span>Unités organisationnelles autorisées ({{ unitesOrgCreListe.length }})</span>
              <div class="d-flex align-center ga-2">
                <v-btn color="primary" variant="text" size="small" @click="dialogChoixUO = true">
                  Ajouter une unité
                </v-btn>
                <span>Choix</span>
                <v-btn-toggle v-model="modeChoixUO" mandatory density="compact" color="primary">
                  <v-btn value="unique" size="small" class="text-none">
                    unique
                  </v-btn>
                  <v-btn value="multiple" size="small" class="text-none">
                    multiple
                  </v-btn>
                </v-btn-toggle>
              </div>
            </v-list-subheader>
            <v-list-item v-for="uniteOrgCre in unitesOrgCreListe" :key="uniteOrgCre.idorgunit"
              :value="uniteOrgCre.idorgunit">
              <template v-slot:prepend>
                <v-btn color="grey-lighten-1" icon="mdi-delete" variant="text"
                  @click="supprimeUniteOrgCre(uniteOrgCre.idorgunit)"></v-btn>
              </template>
              <template v-slot:title>
                <span class="listeempnom mx-2">{{ uniteOrgCre.treeorgunit }}</span>
                <span class="listeemplogin mx-2">({{ uniteOrgCre.nombrecreations }})</span>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </v-main>
  </v-app>

  <v-dialog v-model="dialogChoixUO" max-width="1280">
    <v-card>
      <v-card-text>
        <Suspense>
          <UniteOrgChoix :ssServer="ssServer" :modeChoix="modeChoixUO" @choixUniteOrg="receptionUniteOrg">
          </UniteOrgChoix>
        </Suspense>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Fermer" @click="closeChoixUO()"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { ApiResponseUI, UserInfo } from './CallerInfo.vue'
import type { ApiResponseIG } from './CallerIsInGroup.vue'
import type { TypeAffaireUniteOrgCre, ApiResponseUOC, UniteOrganisationnelle, ApiResponse } from '@/axioscalls.ts'
import { ref } from 'vue'
import CallerInfo from './CallerInfo.vue';
import CallerIsInGroup from './CallerIsInGroup.vue';
import TypesAffaireListeChoix from './TypesAffaireListeChoix.vue';
import { getTypeAffaireUniteOrgCreListe, sauveTypeAffaireOrgunitCreation } from '@/axioscalls.ts'

interface UOChoisie {
  id: number
  nom: string
  description?: string
}
interface DataSauve {
  action: string
  idtypeaffaire: number
  iduniteorg: number
}

const messageErreur = ref<string | undefined>('')
const message = ref<string>('')
let erreurSauve: boolean = false

//Data caller et droits caller
const callerInformation = ref<UserInfo | null | undefined>(null)
const bGoelandManager = ref<boolean>(false)

const idTypeAffaireChoisi = ref<number | null>(null)
const unitesOrgCreListe = ref<TypeAffaireUniteOrgCre[]>([])
const dialogChoixUO = ref<boolean>(false)
const modeChoixUO = ref<string>('unique')
const ssServer = ref<string>('')
if (import.meta.env.DEV) {
  ssServer.value = 'https://mygolux.lausanne.ch'
}
const ssPage: string = '/goeland/gestion_spec/typeaffaire_droitcreation/ajax/typeaffaire_unitesorg_creation_liste.php'
const ssPageSauve: string = '/goeland/gestion_spec/typeaffaire_droitcreation/ajax/typeaffaire_unitesorg_creation_sauve.php'

const listeUniteOrgCre = async (idTypeAffaire: number): Promise<void> => {
  const response: ApiResponseUOC = await getTypeAffaireUniteOrgCreListe(ssServer.value, ssPage, idTypeAffaire)
  if (response.success === false) {
    messageErreur.value += `${response.message}\n`
  } else {
    if (erreurSauve === false) {
      messageErreur.value = ''
    }
  }
  unitesOrgCreListe.value = response.success && response.data ? response.data : []
}

const closeChoixUO = (): void => {
  dialogChoixUO.value = false
}

const supprimeUniteOrgCre = async (idUniteOrg: number): Promise<void> => {
  if (idTypeAffaireChoisi.value !== null) {
    const oData: DataSauve = {
      action: 'supprime',
      idtypeaffaire: idTypeAffaireChoisi.value,
      iduniteorg: idUniteOrg
    }
    const response: ApiResponse<[]> = await sauveTypeAffaireOrgunitCreation(ssServer.value, ssPageSauve, JSON.stringify(oData))
    if (response.success === false) {
      messageErreur.value += `${response.message}\n`
      erreurSauve = true
    } else {
      erreurSauve = false
    }
    listeUniteOrgCre(idTypeAffaireChoisi.value)
  }
}

const receptionTypeAffaire = (idTypeAffaire: number, jsonData: string) => {
  idTypeAffaireChoisi.value = idTypeAffaire
  if (idTypeAffaire > 0) {
    listeUniteOrgCre(idTypeAffaire)
  } else {
    idTypeAffaireChoisi.value = null
  }
}

const receptionUniteOrg = (jsonData: string) => {
  dialogChoixUO.value = false
  if (modeChoixUO.value == 'unique') { jsonData = `[${jsonData}]` }
  const uoChoisie: UOChoisie[] = JSON.parse(jsonData)
  console.log(jsonData)
  uoChoisie.forEach(async (item: UOChoisie) => {
    if (idTypeAffaireChoisi.value !== null) {
      const oData: DataSauve = {
        action: 'sauve',
        idtypeaffaire: idTypeAffaireChoisi.value,
        iduniteorg: item.id
      }
      const response: ApiResponse<[]> = await sauveTypeAffaireOrgunitCreation(ssServer.value, ssPageSauve, JSON.stringify(oData))
      if (response.success === false) {
        messageErreur.value += `${response.message}\n`
        erreurSauve = true
      } else {
        erreurSauve = false
      }
      listeUniteOrgCre(idTypeAffaireChoisi.value)
    }
  })
}

const receptionCallerInfo = (jsonData: string) => {
  const retCallerInformation = ref<ApiResponseUI>(JSON.parse(jsonData))
  if (retCallerInformation.value.success) {
    callerInformation.value = retCallerInformation.value.data
  }
}

const receptionCallerInGroupGoelandManager = (jsonData: string) => {
  const retCallerInGroup = ref<ApiResponseIG>(JSON.parse(jsonData))
  if (retCallerInGroup.value.success && retCallerInGroup.value.data !== undefined) {
    bGoelandManager.value = retCallerInGroup.value.data.isingroup
  }
  if (!bGoelandManager.value) {
    messageErreur.value = "Page réservée aux managers goéland"
  }
}  
</script>

<style scoped>
#divErreur {
    background-color: lightsalmon;
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 0px;
    padding: 5px;
    border-style: solid;
    border-width: thin;
    border-color: black;
    border-radius: 20px;
    white-space: pre-line;
    /* Convertit les \n en sauts de ligne */
}
#divMessage {
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 0px;
    padding: 5px;
    border-style: solid;
    border-width: thin;
    border-color: black;
    border-radius: 20px;
    white-space: pre-line;
    /* Convertit les \n en sauts de ligne */
}
</style>
