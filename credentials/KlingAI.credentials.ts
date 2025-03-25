import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KlingAI implements ICredentialType {
	name = 'klingAI';
	displayName = 'Kling AI API';
	documentationUrl = 'https://docs.qingque.cn/d/home/eZQA6m4cRjTB1BBiE5eJ4lyvL?identityId=1oEG9JKKMFv';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			default: '',
			required: true,
			description: 'JWT token for Kling AI API. Must be generated according to Kling AI specifications with proper header {"alg":"HS256","typ":"JWT"} and payload {"iss":"YOUR_ACCESS_KEY","exp":EXPIRATION_TIME,"nbf":NOT_BEFORE_TIME}.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': '=Bearer {{$credentials.apiToken.trim().replace(/^Bearer\\s+/i, "")}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.klingai.com',
			url: '/account/costs',
			method: 'GET',
			qs: {
				start_time: Date.now() - 24 * 60 * 60 * 1000,
				end_time: Date.now(),
			},
		},
	};
}
