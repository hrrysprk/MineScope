include { ASSEMBLE_READS }    from './modules/assemble_reads'
include { PATHWAY_PROFILING } from './modules/pathway_profiling'

workflow {
    db_ch = channel.fromPath(params.db_path, type: 'dir')

    if (params.input_fasta) {
        contigs_ch = channel.fromPath(params.input_fasta)
    } else {
        ASSEMBLE_READS(channel.fromPath(params.input_fastq))
        contigs_ch = ASSEMBLE_READS.out.contigs
    }

    PATHWAY_PROFILING(contigs_ch, db_ch)
}