import { Domain, Utils } from '$lib'

export const VerboseResponse: { value: boolean } = $state({ value: true })

export const TELEMETRY_CONTEXT: string = 'app-telemetry'

export const TelemetryContext: { value?: Symbol } = $state({ value: Symbol(TELEMETRY_CONTEXT) })

//@ts-expect-error
export const Theme: { value: Domain.Entities.Theme.Theme } = $state({ value: 'light' })

//@ts-expect-error
export const ThemeColor: { value: Domain.Entities.Theme.Color } = $state({ value: 'primary' })

export const Toast: Domain.Entities.State.Toast = $state({})

export const Loading: { value?: string } = $state({})

export const AuthenticationHeaders: { value?: Domain.Entities.Iam.AuthenticationHeaders } = $state({})

export const OpenidEndpoints: { value?: Domain.Entities.Iam.OpenIDEndpoints } = $state({})

export const Session: { session?: Domain.Entities.State.Session } = $state({})

export function ResetSession() {
	Session.session = undefined
}

export function GetGroupNavigationPath(path: string, directoryGroupID?: string) {
	path = Utils.Env.GetLocationPath(path)
	if (directoryGroupID) {
		path += `?${Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID}=${directoryGroupID}`
	}

	return path
}
