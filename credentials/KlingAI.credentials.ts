import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KlingAI implements ICredentialType {
	name = 'klingAI';
	displayName = 'Kling AI API';
	documentationUrl = 'https://docs.qingque.cn/d/home/eZQCQxBrX8eeImjK6Ddz5iOi5?identityId=1oEG9JKKMFv';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key',
			name: 'accessKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The Access Key for the Kling AI API',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'The Secret Key for the Kling AI API',
		},
	];

	// JWT token will be generated in the node during execution
	// This is because JWT tokens must be freshly generated for each request
	// with proper expiration times per the API documentation

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.klingai.com',
			url: '/account/costs',
			method: 'GET',
			qs: {
				start_time: '={{Date.now() - 24 * 60 * 60 * 1000}}',
				end_time: '={{Date.now()}}',
			},
		},
	};
}
