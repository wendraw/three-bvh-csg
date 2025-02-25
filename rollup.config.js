import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify( exec );

// 生成类型声明文件
async function generateTypes() {

	try {

		console.log( 'Generating TypeScript declaration files...' );
		await execAsync( 'tsc --project tsconfig.json' );
		console.log( 'TypeScript declaration files generated successfully.' );

	} catch ( error ) {

		console.error( 'Error generating TypeScript declaration files:', error );
		throw error;

	}

}

export default ( async () => {

	// 先生成类型声明文件
	await generateTypes();

	return [
		{
			input: './src/index.js',
			treeshake: false,
			external: p => /^three/.test( p ),
			plugins: [
				typescript(),
			],
			output: {
				name: 'ThreBvhCsg',
				extend: true,
				format: 'umd',
				file: './build/index.umd.cjs',
				sourcemap: true,

				globals: p => {

					if ( /^three-mesh-bvh/.test( p ) ) {

						return 'MeshBVHLib';

					} else if ( /^three/.test( p ) ) {

						return 'THREE';

					}

					return null;

				},
			},
		},
		{
			input: './src/index.js',
			treeshake: false,
			external: p => /^three/.test( p ),
			plugins: [
				typescript(),
			],
			output: {
				format: 'esm',
				file: './build/index.module.js',
				sourcemap: true,
			},
		},
		// 将生成的所有 .d.ts 文件合并为一个
		{
			input: './build/index.d.ts',
			output: {
				file: './build/index.d.ts',
				format: 'es',
			},
			plugins: [
				dts(),
			],
		}
	];

} )();
