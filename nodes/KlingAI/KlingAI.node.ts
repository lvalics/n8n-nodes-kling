import { IExecuteFunctions } from 'n8n-core';
import {
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import * as jwt from 'jsonwebtoken';

export class KlingAI implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kling AI',
		name: 'klingAI',
		icon: 'file:klingai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Kling AI API',
		defaults: {
			name: 'Kling AI',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'klingAI',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Video',
						value: 'video',
					},
					{
						name: 'Virtual Try-on',
						value: 'tryOn',
					},
					{
						name: 'Account',
						value: 'account',
					},
				],
				default: 'image',
			},

			// Image resource operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'image',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create an image',
						action: 'Create an image',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get image generation details',
						action: 'Get image generation details',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List image generations',
						action: 'List image generations',
					},
				],
				default: 'create',
			},

			// Video resource operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
					},
				},
				options: [
					{
						name: 'Text to Video',
						value: 'text2video',
						description: 'Generate video from text',
						action: 'Generate video from text',
					},
					{
						name: 'Image to Video',
						value: 'image2video',
						description: 'Generate video from image',
						action: 'Generate video from image',
					},
					{
						name: 'Lip Sync',
						value: 'lipSync',
						description: 'Generate lip sync video',
						action: 'Generate lip sync video',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get video generation details',
						action: 'Get video generation details',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List video generations',
						action: 'List video generations',
					},
				],
				default: 'text2video',
			},

			// Virtual Try-on resource operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create virtual try-on',
						action: 'Create virtual try on',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get virtual try-on details',
						action: 'Get virtual try on details',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List virtual try-ons',
						action: 'List virtual try ons',
					},
				],
				default: 'create',
			},

			// Account resource operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'account',
						],
					},
				},
				options: [
					{
						name: 'Get Resource Packages',
						value: 'getResourcePackages',
						description: 'Get account resource packages',
						action: 'Get account resource packages',
					},
				],
				default: 'getResourcePackages',
			},

			// Create Image parameters
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'create',
						],
					},
				},
				options: [
					{
						name: 'Kling V1',
						value: 'kling-v1',
					},
					{
						name: 'Kling V1.5',
						value: 'kling-v1-5',
					},
				],
				default: 'kling-v1',
				description: 'The model to use for image generation',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: 'The prompt to generate images from',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negativePrompt',
				type: 'string',
				required: false,
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: 'The negative prompt to avoid in generation',
			},
			{
				displayName: 'Number of Images',
				name: 'n',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 9,
				},
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'create',
						],
					},
				},
				default: 1,
				description: 'How many images to generate',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'create',
						],
					},
				},
				options: [
					{
						name: '16:9',
						value: '16:9',
					},
					{
						name: '9:16',
						value: '9:16',
					},
					{
						name: '1:1',
						value: '1:1',
					},
					{
						name: '4:3',
						value: '4:3',
					},
					{
						name: '3:4',
						value: '3:4',
					},
					{
						name: '3:2',
						value: '3:2',
					},
					{
						name: '2:3',
						value: '2:3',
					},
					{
						name: '21:9',
						value: '21:9',
					},
				],
				default: '16:9',
				description: 'The aspect ratio of the generated images',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'create',
						],
					},
				},
				options: [
					{
						displayName: 'Reference Image',
						name: 'image',
						type: 'string',
						default: '',
						description: 'URL or Base64-encoded image to use as reference',
					},
					{
						displayName: 'Image Reference Type',
						name: 'imageReference',
						type: 'options',
						options: [
							{
								name: 'Subject',
								value: 'subject',
							},
							{
								name: 'Face',
								value: 'face',
							},
						],
						default: 'subject',
						description: 'Type of image reference',
					},
					{
						displayName: 'Image Fidelity',
						name: 'imageFidelity',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.5,
						description: 'Reference intensity for user-uploaded images',
					},
					{
						displayName: 'Callback URL',
						name: 'callbackUrl',
						type: 'string',
						default: '',
						description: 'URL to call when generation is complete',
					},
				],
			},

			// Get Image parameters
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'get',
						],
					},
				},
				default: '',
				description: 'The ID of the image generation task',
			},

			// List Images parameters
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'image',
						],
						operation: [
							'list',
						],
					},
				},
				options: [
					{
						displayName: 'Page Number',
						name: 'pageNum',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Page number to retrieve',
					},
					{
						displayName: 'Page Size',
						name: 'pageSize',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 500,
						},
						default: 30,
						description: 'Number of results per page',
					},
				],
			},

			// Text to Video parameters
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'text2video',
						],
					},
				},
				options: [
					{
						name: 'Kling V1',
						value: 'kling-v1',
					},
					{
						name: 'Kling V1-6',
						value: 'kling-v1-6',
					},
				],
				default: 'kling-v1',
				description: 'The model to use for video generation',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'text2video',
						],
					},
				},
				default: '',
				description: 'The prompt to generate video from',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'text2video',
						],
					},
				},
				options: [
					{
						name: 'Standard',
						value: 'std',
					},
					{
						name: 'Professional',
						value: 'pro',
					},
				],
				default: 'std',
				description: 'Video generation mode',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'text2video',
						],
					},
				},
				options: [
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '10 Seconds',
						value: '10',
					},
				],
				default: '5',
				description: 'Duration of the generated video',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'text2video',
						],
					},
				},
				options: [
					{
						displayName: 'Negative Prompt',
						name: 'negativePrompt',
						type: 'string',
						default: '',
						description: 'The negative prompt to avoid in generation',
					},
					{
						displayName: 'CFG Scale',
						name: 'cfgScale',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.5,
						description: 'Flexibility in video generation',
					},
					{
						displayName: 'Aspect Ratio',
						name: 'aspectRatio',
						type: 'options',
						options: [
							{
								name: '16:9',
								value: '16:9',
							},
							{
								name: '9:16',
								value: '9:16',
							},
							{
								name: '1:1',
								value: '1:1',
							},
						],
						default: '16:9',
						description: 'The aspect ratio of the generated video',
					},
					{
						displayName: 'Callback URL',
						name: 'callbackUrl',
						type: 'string',
						default: '',
						description: 'URL to call when generation is complete',
					},
					{
						displayName: 'External Task ID',
						name: 'externalTaskId',
						type: 'string',
						default: '',
						description: 'Custom task ID for tracking',
					},
				],
			},

			// Image to Video parameters
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'image2video',
						],
					},
				},
				options: [
					{
						name: 'Kling V1',
						value: 'kling-v1',
					},
					{
						name: 'Kling V1-5',
						value: 'kling-v1-5',
					},
					{
						name: 'Kling V1-6',
						value: 'kling-v1-6',
					},
				],
				default: 'kling-v1',
				description: 'The model to use for video generation',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'image2video',
						],
					},
				},
				options: [
					{
						name: 'Standard',
						value: 'std',
					},
					{
						name: 'Professional',
						value: 'pro',
					},
				],
				default: 'std',
				description: 'Video generation mode',
			},
			{
				displayName: 'Image',
				name: 'image',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'image2video',
						],
					},
				},
				default: '',
				description: 'URL or Base64-encoded image to animate',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'image2video',
						],
					},
				},
				default: '',
				description: 'Optional prompt to guide animation',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'image2video',
						],
					},
				},
				options: [
					{
						name: '5 Seconds',
						value: '5',
					},
					{
						name: '10 Seconds',
						value: '10',
					},
				],
				default: '5',
				description: 'Duration of the generated video',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'image2video',
						],
					},
				},
				options: [
					{
						displayName: 'End Frame Image',
						name: 'imageTail',
						type: 'string',
						default: '',
						description: 'URL or Base64-encoded image for end frame',
					},
					{
						displayName: 'Negative Prompt',
						name: 'negativePrompt',
						type: 'string',
						default: '',
						description: 'The negative prompt to avoid in generation',
					},
					{
						displayName: 'CFG Scale',
						name: 'cfgScale',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0.5,
						description: 'Flexibility in video generation',
					},
					{
						displayName: 'Callback URL',
						name: 'callbackUrl',
						type: 'string',
						default: '',
						description: 'URL to call when generation is complete',
					},
					{
						displayName: 'External Task ID',
						name: 'externalTaskId',
						type: 'string',
						default: '',
						description: 'Custom task ID for tracking',
					},
				],
			},

			// Lip Sync parameters
			{
				displayName: 'Input',
				name: 'input',
				type: 'collection',
				placeholder: 'Input Options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'lipSync',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Video ID',
						name: 'videoId',
						type: 'string',
						default: '',
						description: 'ID of video generated by Kling AI',
					},
					{
						displayName: 'Video URL',
						name: 'videoUrl',
						type: 'string',
						default: '',
						description: 'URL of uploaded video',
					},
					{
						displayName: 'Mode',
						name: 'mode',
						type: 'options',
						options: [
							{
								name: 'Text to Video',
								value: 'text2video',
							},
							{
								name: 'Audio to Video',
								value: 'audio2video',
							},
						],
						default: 'text2video',
						description: 'Lip sync mode',
					},
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						displayOptions: {
							show: {
								'/input.mode': [
									'text2video',
								],
							},
						},
						default: '',
						description: 'Text content for lip sync',
					},
					{
						displayName: 'Voice ID',
						name: 'voiceId',
						type: 'string',
						displayOptions: {
							show: {
								'/input.mode': [
									'text2video',
								],
							},
						},
						default: '',
						description: 'Voice ID for speech synthesis',
					},
					{
						displayName: 'Voice Language',
						name: 'voiceLanguage',
						type: 'options',
						displayOptions: {
							show: {
								'/input.mode': [
									'text2video',
								],
							},
						},
						options: [
							{
								name: 'Chinese',
								value: 'zh',
							},
							{
								name: 'English',
								value: 'en',
							},
						],
						default: 'zh',
						description: 'Language of the voice',
					},
					{
						displayName: 'Voice Speed',
						name: 'voiceSpeed',
						type: 'number',
						displayOptions: {
							show: {
								'/input.mode': [
									'text2video',
								],
							},
						},
						typeOptions: {
							minValue: 0.8,
							maxValue: 2.0,
							numberPrecision: 1,
						},
						default: 1.0,
						description: 'Speed of speech',
					},
					{
						displayName: 'Audio Type',
						name: 'audioType',
						type: 'options',
						displayOptions: {
							show: {
								'/input.mode': [
									'audio2video',
								],
							},
						},
						options: [
							{
								name: 'File',
								value: 'file',
							},
							{
								name: 'URL',
								value: 'url',
							},
						],
						default: 'url',
						description: 'How to provide audio',
					},
					{
						displayName: 'Audio File',
						name: 'audioFile',
						type: 'string',
						displayOptions: {
							show: {
								'/input.audioType': [
									'file',
								],
								'/input.mode': [
									'audio2video',
								],
							},
						},
						default: '',
						description: 'Base64-encoded audio file',
					},
					{
						displayName: 'Audio URL',
						name: 'audioUrl',
						type: 'string',
						displayOptions: {
							show: {
								'/input.audioType': [
									'url',
								],
								'/input.mode': [
									'audio2video',
								],
							},
						},
						default: '',
						description: 'URL of audio file',
					},
				],
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				required: false,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'lipSync',
						],
					},
				},
				default: '',
				description: 'URL to call when lip sync is complete',
			},

			// Video Get parameters
			{
				displayName: 'Video Type',
				name: 'videoType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'get',
						],
					},
				},
				options: [
					{
						name: 'Text to Video',
						value: 'text2video',
					},
					{
						name: 'Image to Video',
						value: 'image2video',
					},
					{
						name: 'Lip Sync',
						value: 'lipSync',
					},
					{
						name: 'Video Extension',
						value: 'videoExtend',
					},
					{
						name: 'Video Effects',
						value: 'effects',
					},
				],
				default: 'text2video',
				description: 'Type of video generation',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'get',
						],
					},
				},
				default: '',
				description: 'ID of the video generation task',
			},
			{
				displayName: 'External Task ID',
				name: 'externalTaskId',
				type: 'string',
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'get',
						],
					},
				},
				default: '',
				description: 'Custom ID for the task (if provided during creation)',
			},

			// Video List parameters
			{
				displayName: 'Video Type',
				name: 'videoType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'list',
						],
					},
				},
				options: [
					{
						name: 'Text to Video',
						value: 'text2video',
					},
					{
						name: 'Image to Video',
						value: 'image2video',
					},
					{
						name: 'Lip Sync',
						value: 'lipSync',
					},
					{
						name: 'Video Extension',
						value: 'videoExtend',
					},
					{
						name: 'Video Effects',
						value: 'effects',
					},
				],
				default: 'text2video',
				description: 'Type of video generation',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'video',
						],
						operation: [
							'list',
						],
					},
				},
				options: [
					{
						displayName: 'Page Number',
						name: 'pageNum',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Page number to retrieve',
					},
					{
						displayName: 'Page Size',
						name: 'pageSize',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 500,
						},
						default: 30,
						description: 'Number of results per page',
					},
				],
			},

			// Virtual Try-on parameters
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
						operation: [
							'create',
						],
					},
				},
				options: [
					{
						name: 'Kolors Virtual Try-on V1',
						value: 'kolors-virtual-try-on-v1',
					},
					{
						name: 'Kolors Virtual Try-on V1.5',
						value: 'kolors-virtual-try-on-v1-5',
					},
				],
				default: 'kolors-virtual-try-on-v1',
				description: 'The model to use for virtual try-on',
			},
			{
				displayName: 'Human Image',
				name: 'humanImage',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: 'URL or Base64-encoded image of person',
			},
			{
				displayName: 'Cloth Image',
				name: 'clothImage',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: 'URL or Base64-encoded image of clothing',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				required: false,
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: 'URL to call when try-on is complete',
			},

			// Virtual Try-on Get parameters
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
						operation: [
							'get',
						],
					},
				},
				default: '',
				description: 'ID of the virtual try-on task',
			},

			// Virtual Try-on List parameters
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'tryOn',
						],
						operation: [
							'list',
						],
					},
				},
				options: [
					{
						displayName: 'Page Number',
						name: 'pageNum',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Page number to retrieve',
					},
					{
						displayName: 'Page Size',
						name: 'pageSize',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 500,
						},
						default: 30,
						description: 'Number of results per page',
					},
				],
			},

			// Account Resource Package parameters
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'account',
						],
						operation: [
							'getResourcePackages',
						],
					},
				},
				default: '={{Date.now() - 30 * 24 * 60 * 60 * 1000}}',
				description: 'Start time for the query (Unix timestamp in ms)',
			},
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'account',
						],
						operation: [
							'getResourcePackages',
						],
					},
				},
				default: '={{Date.now()}}',
				description: 'End time for the query (Unix timestamp in ms)',
			},
			{
				displayName: 'Resource Pack Name',
				name: 'resourcePackName',
				type: 'string',
				required: false,
				displayOptions: {
					show: {
						resource: [
							'account',
						],
						operation: [
							'getResourcePackages',
						],
					},
				},
				default: '',
				description: 'Resource package name for precise querying',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Generate JWT token for authorization
		const credentials = await this.getCredentials('klingAI') as {
			accessKey: string;
			secretKey: string;
		};

		const { accessKey, secretKey } = credentials;

		// Generate JWT token as per Kling AI documentation
		const generateToken = () => {
			const now = Math.floor(Date.now() / 1000);
			const payload = {
				iss: accessKey,
				exp: now + 1800, // valid for 30 minutes
				nbf: now - 5, // valid from 5 seconds ago
			};

			const options = {
				algorithm: 'HS256',
				header: {
					alg: 'HS256',
					typ: 'JWT',
				},
			};

			return jwt.sign(payload, secretKey, options);
		};

		const token = generateToken();

		// Set base API URL and headers
		const baseUrl = 'https://api.klingai.com';
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		};

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let endpoint = '';
				let method = 'GET';
				let body: IDataObject = {};
				let qs: IDataObject = {};

				// Build the request based on resource and operation
				if (resource === 'image') {
					if (operation === 'create') {
						// Create image generation
						endpoint = '/v1/images/generations';
						method = 'POST';

						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						const n = this.getNodeParameter('n', i, 1) as number;
						const aspectRatio = this.getNodeParameter('aspectRatio', i, '16:9') as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						body = {
							model_name: model,
							prompt,
							n,
							aspect_ratio: aspectRatio,
						};

						if (negativePrompt) {
							body.negative_prompt = negativePrompt;
						}

						if (additionalOptions.image) {
							body.image = additionalOptions.image;
						}

						if (additionalOptions.imageReference) {
							body.image_reference = additionalOptions.imageReference;
						}

						if (additionalOptions.imageFidelity !== undefined) {
							body.image_fidelity = additionalOptions.imageFidelity;
						}

						if (additionalOptions.callbackUrl) {
							body.callback_url = additionalOptions.callbackUrl;
						}
					} else if (operation === 'get') {
						// Get image generation
						const taskId = this.getNodeParameter('taskId', i) as string;
						endpoint = `/v1/images/generations/${taskId}`;
					} else if (operation === 'list') {
						// List image generations
						endpoint = '/v1/images/generations';

						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						if (additionalOptions.pageNum) {
							qs.pageNum = additionalOptions.pageNum;
						}

						if (additionalOptions.pageSize) {
							qs.pageSize = additionalOptions.pageSize;
						}
					}
				} else if (resource === 'video') {
					if (operation === 'text2video') {
						// Text to video
						endpoint = '/v1/videos/text2video';
						method = 'POST';

						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const mode = this.getNodeParameter('mode', i) as string;
						const duration = this.getNodeParameter('duration', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						body = {
							model_name: model,
							prompt,
							mode,
							duration,
						};

						if (additionalOptions.negativePrompt) {
							body.negative_prompt = additionalOptions.negativePrompt;
						}

						if (additionalOptions.cfgScale !== undefined) {
							body.cfg_scale = additionalOptions.cfgScale;
						}

						if (additionalOptions.aspectRatio) {
							body.aspect_ratio = additionalOptions.aspectRatio;
						}

						if (additionalOptions.callbackUrl) {
							body.callback_url = additionalOptions.callbackUrl;
						}

						if (additionalOptions.externalTaskId) {
							body.external_task_id = additionalOptions.externalTaskId;
						}
					} else if (operation === 'image2video') {
						// Image to video
						endpoint = '/v1/videos/image2video';
						method = 'POST';

						const model = this.getNodeParameter('model', i) as string;
						const mode = this.getNodeParameter('mode', i) as string;
						const image = this.getNodeParameter('image', i) as string;
						const prompt = this.getNodeParameter('prompt', i, '') as string;
						const duration = this.getNodeParameter('duration', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						body = {
							model_name: model,
							mode,
							image,
							duration,
						};

						if (prompt) {
							body.prompt = prompt;
						}

						if (additionalOptions.imageTail) {
							body.image_tail = additionalOptions.imageTail;
						}

						if (additionalOptions.negativePrompt) {
							body.negative_prompt = additionalOptions.negativePrompt;
						}

						if (additionalOptions.cfgScale !== undefined) {
							body.cfg_scale = additionalOptions.cfgScale;
						}

						if (additionalOptions.callbackUrl) {
							body.callback_url = additionalOptions.callbackUrl;
						}

						if (additionalOptions.externalTaskId) {
							body.external_task_id = additionalOptions.externalTaskId;
						}
					} else if (operation === 'lipSync') {
						// Lip sync
						endpoint = '/v1/videos/lip-sync';
						method = 'POST';

						const input = this.getNodeParameter('input', i) as IDataObject;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						body = { input };

						if (callbackUrl) {
							body.callback_url = callbackUrl;
						}
					} else if (operation === 'get') {
						// Get video
						const videoType = this.getNodeParameter('videoType', i) as string;
						const taskId = this.getNodeParameter('taskId', i, '') as string;
						const externalTaskId = this.getNodeParameter('externalTaskId', i, '') as string;

						if (taskId) {
							endpoint = `/v1/videos/${videoType}/${taskId}`;
						} else if (externalTaskId) {
							endpoint = `/v1/videos/${videoType}/${externalTaskId}`;
						} else {
							throw new NodeOperationError(this.getNode(), 'Either Task ID or External Task ID must be provided');
						}
					} else if (operation === 'list') {
						// List videos
						const videoType = this.getNodeParameter('videoType', i) as string;
						endpoint = `/v1/videos/${videoType}`;

						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						if (additionalOptions.pageNum) {
							qs.pageNum = additionalOptions.pageNum;
						}

						if (additionalOptions.pageSize) {
							qs.pageSize = additionalOptions.pageSize;
						}
					}
				} else if (resource === 'tryOn') {
					if (operation === 'create') {
						// Create virtual try-on
						endpoint = '/v1/images/kolors-virtual-try-on';
						method = 'POST';

						const model = this.getNodeParameter('model', i) as string;
						const humanImage = this.getNodeParameter('humanImage', i) as string;
						const clothImage = this.getNodeParameter('clothImage', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						body = {
							model_name: model,
							human_image: humanImage,
							cloth_image: clothImage,
						};

						if (callbackUrl) {
							body.callback_url = callbackUrl;
						}
					} else if (operation === 'get') {
						// Get virtual try-on
						const taskId = this.getNodeParameter('taskId', i) as string;
						endpoint = `/v1/images/kolors-virtual-try-on/${taskId}`;
					} else if (operation === 'list') {
						// List virtual try-ons
						endpoint = '/v1/images/kolors-virtual-try-on';

						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

						if (additionalOptions.pageNum) {
							qs.pageNum = additionalOptions.pageNum;
						}

						if (additionalOptions.pageSize) {
							qs.pageSize = additionalOptions.pageSize;
						}
					}
				} else if (resource === 'account') {
					if (operation === 'getResourcePackages') {
						// Get resource packages
						endpoint = '/account/costs';

						const startTime = this.getNodeParameter('startTime', i) as number;
						const endTime = this.getNodeParameter('endTime', i) as number;
						const resourcePackName = this.getNodeParameter('resourcePackName', i, '') as string;

						qs = {
							start_time: startTime,
							end_time: endTime,
						};

						if (resourcePackName) {
							qs.resource_pack_name = resourcePackName;
						}
					}
				}

				// Execute the request
				let responseData;

				const options = {
					method,
					url: baseUrl + endpoint,
					headers,
					qs,
					body: Object.keys(body).length ? body : undefined,
					json: true,
				};

				responseData = await this.helpers.request(options);

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
