<script setup lang="ts">
import { Anchor } from '@scalar/api-reference/components/Anchor'
import { Badge } from '@scalar/api-reference/components/Badge'
import { LinkList } from '@scalar/api-reference/components/LinkList'
import OperationPath from '@scalar/api-reference/components/OperationPath.vue'
import {
  Section,
  SectionColumn,
  SectionColumns,
  SectionContent,
  SectionHeader,
  SectionHeaderTag,
} from '@scalar/api-reference/components/Section'
import VisibleOnIntersect from '@scalar/api-reference/components/VisibleOnIntersect.vue'
import { ExampleResponses } from '@scalar/api-reference/features/example-responses'
import { ExternalDocs } from '@scalar/api-reference/features/external-docs'
import CachedS3UploadLink from '@scalar/api-reference/features/Operation/components/CachedS3UploadLink.vue'
import Callbacks from '@scalar/api-reference/features/Operation/components/callbacks/Callbacks.vue'
import OperationParameters from '@scalar/api-reference/features/Operation/components/OperationParameters.vue'
import OperationResponses from '@scalar/api-reference/features/Operation/components/OperationResponses.vue'
import type { Schemas } from '@scalar/api-reference/features/Operation/types/schemas'
import { TestRequestButton } from '@scalar/api-reference/features/test-request-button'
import { useConfig } from '@scalar/api-reference/hooks/useConfig'
import { RequestExample } from '@scalar/api-reference/v2/blocks/scalar-request-example-block'
import type { ClientOptionGroup } from '@scalar/api-reference/v2/blocks/scalar-request-example-block/types'
import { ScalarErrorBoundary, ScalarMarkdown } from '@scalar/components'
import type { HttpMethod as HttpMethodType } from '@scalar/helpers/http/http-methods'
import { ScalarIconWebhooksLogo } from '@scalar/icons'
import {
  getOperationStability,
  getOperationStabilityColor,
  isOperationDeprecated,
} from '@scalar/oas-utils/helpers'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { WorkspaceStore } from '@scalar/workspace-store/client'
import type { ParameterObject } from '@scalar/workspace-store/schemas/v3.1/strict/parameter'
import type { OperationObject } from '@scalar/workspace-store/schemas/v3.1/strict/path-operations'
import type { SecuritySchemeObject } from '@scalar/workspace-store/schemas/v3.1/strict/security-scheme'
import type { ServerObject } from '@scalar/workspace-store/schemas/v3.1/strict/server'
import type { Dereference } from '@scalar/workspace-store/schemas/v3.1/type-guard'
import { computed, useId } from 'vue'

import StarlightCard from '../../../components/StarlightCard.vue'

const { path, operation, method, isWebhook, oldOperation } = defineProps<{
  id: string
  path: string
  clientOptions: ClientOptionGroup[]
  method: HttpMethodType
  operation: Dereference<OperationObject>
  oldOperation: OpenAPIV3_1.OperationObject
  parameters: ParameterObject[]
  // pathServers: ServerObject[] | undefined
  isWebhook: boolean
  securitySchemes: SecuritySchemeObject[]
  server: ServerObject | undefined
  schemas?: Schemas
  store: WorkspaceStore
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const operationTitle = computed(() => operation.summary || path || '')

const labelId = useId()
const config = useConfig()

const handleDiscriminatorChange = (type: string) => {
  emit('update:modelValue', type)
}
</script>

<template>
  <Section
    :id="id"
    :aria-labelledby="labelId"
    :label="operationTitle"
    tabindex="-1">
    <SectionContent :loading="config.isLoading">
      <Badge
        v-if="getOperationStability(operation)"
        class="capitalize"
        :class="getOperationStabilityColor(operation)">
        {{ getOperationStability(operation) }}
      </Badge>

      <Badge
        v-if="isWebhook"
        class="font-code text-green flex w-fit items-center justify-center gap-1">
        <ScalarIconWebhooksLogo weight="bold" />Webhook
      </Badge>
      <div :class="isOperationDeprecated(operation) ? 'deprecated' : ''">
        <SectionHeader>
          <Anchor :id="id">
            <SectionHeaderTag
              :id="labelId"
              :level="3">
              {{ operationTitle }}
            </SectionHeaderTag>
          </Anchor>
        </SectionHeader>
      </div>
      <SectionColumns>
        <SectionColumn>
          <div class="operation-details">
            <ScalarMarkdown
              :anchorPrefix="id"
              transformType="heading"
              :value="operation.description"
              withAnchors
              withImages />

            <!-- Cached S3 Upload Link -->
            <CachedS3UploadLink :operation="operation" />

            <OperationParameters
              :breadcrumb="[id]"
              :parameters
              :requestBody="oldOperation.requestBody"
              :schemas
              @update:modelValue="handleDiscriminatorChange">
            </OperationParameters>
            <OperationResponses
              :breadcrumb="[id]"
              :responses="oldOperation.responses"
              :schemas="schemas" />

            <!-- Callbacks -->
            <ScalarErrorBoundary>
              <Callbacks
                v-if="operation.callbacks"
                :callbacks="operation.callbacks"
                class="mt-6"
                :method="method"
                :path="path"
                :schemas="schemas" />
            </ScalarErrorBoundary>
          </div>
        </SectionColumn>
        <SectionColumn>
          <div class="examples">
            <!-- External Docs -->
            <LinkList v-if="operation.externalDocs">
              <ExternalDocs :value="operation.externalDocs" />
            </LinkList>

            <div class="mb-2 flex flex-row gap-4">
              <!-- description="Set up the API client" -->
              <StarlightCard
                classNames="flex-1 sl-link-card-small mb-3 flex-1"
                href="#client-libraries"
                title="Install DocSpring Client" />
              <!-- description="Make sure your API token works" -->
              <StarlightCard
                v-if="operation.operationId != 'testAuthentication'"
                classNames="flex-1 sl-link-card-small mb-3 flex-1"
                href="#tag/authentication/get/authentication"
                title="Test Authentication" />
            </div>

            <!-- New Example Request -->
            <ScalarErrorBoundary>
              <VisibleOnIntersect class="example-request">
                <template #default>
                  <RequestExample
                    :clientOptions="clientOptions"
                    fallback
                    :method="method"
                    :operation="operation"
                    :path="path"
                    :securitySchemes="securitySchemes"
                    :selectedClient="store.workspace['x-scalar-default-client']"
                    :selectedServer="server"
                    @update:modelValue="handleDiscriminatorChange">
                    <template #header>
                      <OperationPath
                        class="font-code text-c-2 [&_em]:text-c-1 [&_em]:not-italic"
                        :deprecated="operation?.deprecated"
                        :path="path" />
                    </template>
                    <template
                      v-if="!isWebhook"
                      #footer>
                      <TestRequestButton
                        :method="method"
                        :path="path" />
                    </template>
                  </RequestExample>
                </template>
                <template #placeholder>
                  <div
                    class="operation-example-card"
                    style="min-height: 140px"></div>
                </template>
              </VisibleOnIntersect>
            </ScalarErrorBoundary>

            <ScalarErrorBoundary>
              <ExampleResponses
                :responses="operation.responses"
                style="margin-top: 12px" />
            </ScalarErrorBoundary>
          </div>
        </SectionColumn>
      </SectionColumns>
    </SectionContent>
  </Section>
</template>

<style scoped>
.examples {
  position: sticky;
  top: calc(var(--refs-header-height) + 24px);
}

.examples > * {
  max-height: calc(
    ((var(--full-height) - var(--refs-header-height)) - 60px) / 2
  );
  position: relative;
}

.examples > .example-request {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.example-request :deep(.scalar-card) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.example-request :deep(.request-editor-section) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.example-request :deep(.code-snippet) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.example-request :deep(.scalar-code-block),
.example-request :deep(.scalar-codeblock-pre) {
  max-height: 100%;
  min-height: 0;
  overflow: auto;
}

/*
 * Don't constrain card height on mobile
 * (or zoomed in screens)
 */
@media (max-width: 600px) {
  .examples > * {
    max-height: unset;
  }
}
.deprecated * {
  text-decoration: line-through;
}
</style>
